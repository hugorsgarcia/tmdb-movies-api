import makeWASocket, { 
    AuthenticationState, 
    BufferJSON, 
    DisconnectReason, 
    initAuthCreds,
    Browsers,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { supabase } from '../config/supabase';

// Custom Auth State to store Baileys keys in Supabase
async function useSupabaseAuthState(sessionId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
    const writeData = async (key: string, data: any) => {
        const id = `${sessionId}-${key}`;
        await supabase.from('whatsapp_sessions').upsert({
            id,
            data: JSON.parse(JSON.stringify(data, BufferJSON.replacer))
        });
    };

    const readData = async (key: string) => {
        const id = `${sessionId}-${key}`;
        const { data } = await supabase.from('whatsapp_sessions')
            .select('data')
            .eq('id', id)
            .single();
        if (data?.data) {
            return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
        }
        return null;
    };

    const removeData = async (key: string) => {
        const id = `${sessionId}-${key}`;
        await supabase.from('whatsapp_sessions').delete().eq('id', id);
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: { [key: string]: any } = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = Buffer.from(value.data || value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        for (const id in data[category as keyof typeof data]) {
                            const value = data[category as keyof typeof data]?.[id];
                            const key = `${category}-${id}`;
                            tasks.push(value ? writeData(key, value) : removeData(key));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData('creds', creds)
    };
}

let sock: ReturnType<typeof makeWASocket> | null = null;
export let latestQrCode: string | null = null;
let reconnectAttempts = 0;
let isConnectionOpen = false; // tracks current connection state to avoid waiting when already connected

// Initialize WhatsApp connection
export async function connectToWhatsApp() {
    console.log('Connecting to WhatsApp...');
    const { state, saveCreds } = await useSupabaseAuthState('cinesync');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }) as any,
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
            console.log(`[WhatsApp] QR Code generated! Scan at: ${baseUrl}/api/qrcode`);
            latestQrCode = await qrcode.toDataURL(qr);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            const isConflict = statusCode === 440;

            if (isConflict) {
                isConnectionOpen = false;
                console.warn('[WhatsApp] Stream conflict (440): Another instance is using this session. Waiting 30s before retrying...');
                setTimeout(() => {
                    reconnectAttempts = 0;
                    connectToWhatsApp();
                }, 30000);
                return;
            }

            if (isLoggedOut) {
                console.log('[WhatsApp] Logged out. Wiping session...');
                await supabase.from('whatsapp_sessions').delete().like('id', 'cinesync-%');
                latestQrCode = null;
                isConnectionOpen = false;
                reconnectAttempts = 0;
                connectToWhatsApp();
                return;
            }

            // Generic reconnection with exponential backoff
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 60000);
            console.log(`[WhatsApp] Connection closed (status ${statusCode}). Reconnecting in ${delay/1000}s... (attempt #${reconnectAttempts})`);
            isConnectionOpen = false;
            setTimeout(() => connectToWhatsApp(), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            isConnectionOpen = true;
            console.log('[WhatsApp] Connection opened successfully!');
            latestQrCode = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Returns true for transient errors where the message should be retried later
export function isRetryableError(error: any): boolean {
    const msg = error?.message || '';
    return (
        msg.includes('conflict') ||
        msg.includes('Stream Errored') ||
        msg.includes('Connection Failure') ||
        msg.includes('Connection timeout') ||
        msg.includes('timed out')
    );
}

// Service function to send message
export async function sendWhatsAppMessage(toPhone: string, text: string): Promise<boolean> {
    if (!sock) {
        console.error('WhatsApp socket not initialized!');
        return false;
    }
    try {
        // Format phone number
        let phone = toPhone.replace(/\D/g, '');
        if (!phone.startsWith('55') && phone.length === 11) {
            phone = '55' + phone; 
        }
        const jid = `${phone}@s.whatsapp.net`;
        
        // Only wait for connection if not already open
        if (!isConnectionOpen) {
            console.log('[WhatsApp] Waiting for connection to open...');
            await Promise.race([
                sock.waitForConnectionUpdate((u) => Promise.resolve(u.connection === 'open')),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
            ]);
        }

        // Check if number exists 
        const resultArr = await sock.onWhatsApp(jid);
        const result = resultArr?.[0];
        if (!result?.exists) {
            console.error('Number does not exist on WhatsApp:', phone);
            return false;
        }

        await sock.sendMessage(result.jid, { text });
        console.log(`[WhatsApp] Message sent to ${toPhone}`);
        return true;
    } catch (error: any) {
        console.error('Failed to send WhatsApp message:', error?.message || error);
        // Re-throw so cronJob can detect retryable errors
        throw error;
    }
}
