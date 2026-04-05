import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { sendWhatsAppMessage } from '../services/whatsapp';
import { sendEmailMessage } from '../services/email';

export function startCronWorker() {
    console.log('Cron worker started, polling every 1 minute...');

    cron.schedule('* * * * *', async () => {
        try {
            console.log('Polling notifications...');

            // Step 1: Atomic claim — UPDATE pending → processing, return what we claimed.
            // Only the instance that wins this race will process the notification.
            // Any other concurrent instance will find no rows to claim (already processing/sent).
            const { data: claimed, error: claimError } = await supabase
                .from('notifications')
                .update({
                    status: 'processing',
                    updated_at: new Date().toISOString()
                })
                .eq('status', 'pending')
                .lte('scheduled_at', new Date().toISOString())
                .select();

            if (claimError) {
                console.error('Error claiming notifications:', claimError);
                return;
            }

            if (!claimed || claimed.length === 0) {
                return;
            }

            console.log(`Claimed ${claimed.length} notification(s) for processing.`);

            for (const notif of claimed) {
                let success = false;

                try {
                    console.log(`Processing [${notif.id}] via ${notif.channel} for ${notif.destination}`);

                    if (notif.channel === 'whatsapp') {
                        success = await sendWhatsAppMessage(notif.destination, notif.body);
                    } else if (notif.channel === 'email') {
                        success = await sendEmailMessage(
                            notif.destination,
                            notif.title || 'CineSync Reminder',
                            notif.body
                        );
                    } else {
                        console.error('Unknown channel:', notif.channel);
                    }
                } catch (e: any) {
                    console.error(`Error sending notification [${notif.id}]:`, e.message);
                }

                // Step 2: Mark final status
                const finalStatus = success ? 'sent' : 'failed';
                await supabase
                    .from('notifications')
                    .update({
                        status: finalStatus,
                        error_log: success ? null : 'Channel delivery failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', notif.id);

                console.log(`Notification [${notif.id}] marked as ${finalStatus}.`);
            }
        } catch (e) {
            console.error('Cron job crashed:', e);
        }
    });
}
