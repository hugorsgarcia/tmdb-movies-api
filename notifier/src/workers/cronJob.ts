import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { sendWhatsAppMessage } from '../services/whatsapp';
import { sendEmailMessage } from '../services/email';

export function startCronWorker() {
    console.log('Cron worker started, polling every 1 minute...');

    // Run every minute at the 0th second
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Polling notifications...');
            
            // Note: In a heavily scaled system, we would use a real queue or SELECT FOR UPDATE SKIP LOCKED
            // For CineSync, querying every minute for pending is sufficient.
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('status', 'pending')
                .lte('scheduled_at', new Date().toISOString());

            if (error) {
                console.error('Error polling notifications:', error);
                return;
            }

            if (!data || data.length === 0) {
                return;
            }

            console.log(`Found ${data.length} pending notifications.`);

            for (const notif of data) {
                let success = false;
                
                try {
                    console.log(`Processing notification [${notif.id}] via ${notif.channel} for ${notif.destination}`);
                    
                    if (notif.channel === 'whatsapp') {
                        success = await sendWhatsAppMessage(notif.destination, notif.body);
                    } else if (notif.channel === 'email') {
                        success = await sendEmailMessage(notif.destination, notif.title || 'CineSync Reminder', notif.body);
                    } else {
                        console.error('Unknown channel:', notif.channel);
                    }
                } catch (e: any) {
                    console.error(`Error sending notification [${notif.id}]:`, e);
                }

                if (success) {
                    await supabase.from('notifications').update({
                        status: 'sent',
                        updated_at: new Date().toISOString()
                    }).eq('id', notif.id);
                } else {
                    await supabase.from('notifications').update({
                        status: 'failed',
                        error_log: 'Channel delivery failed',
                        updated_at: new Date().toISOString()
                    }).eq('id', notif.id);
                }
            }
        } catch (e) {
            console.error('Cron job crashed:', e);
        }
    });
}
