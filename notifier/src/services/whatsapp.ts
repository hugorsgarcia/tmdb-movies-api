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

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('QR Code generated. Accessible via GET /api/qrcode');
            // Store QR as base64 image
            latestQrCode = await qrcode.toDataURL(qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                // reconnect if not logged out
                connectToWhatsApp();
            } else {
                // logged out, wipe session
                console.log('Logged out. Wiping session...');
                await supabase.from('whatsapp_sessions').delete().like('id', 'cinesync-%');
                latestQrCode = null;
                connectToWhatsApp(); // Start fresh
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened!');
            latestQrCode = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);
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
        
        // Wait for connection to be active
        await sock.waitForConnectionUpdate((u) => Promise.resolve(u.connection === 'open'));

        // Check if number exists 
        const resultArr = await sock.onWhatsApp(jid);
        const result = resultArr?.[0];
        if (!result?.exists) {
            console.error('Number does not exist on WhatsApp:', phone);
            return false;
        }

        await sock.sendMessage(result.jid, { text });
        console.log(`WhatsApp message sent to ${toPhone}`);
        return true;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return false;
    }
}
