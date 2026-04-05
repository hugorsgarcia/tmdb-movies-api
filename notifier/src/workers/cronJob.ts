import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { sendWhatsAppMessage, isRetryableError } from '../services/whatsapp';
import { sendEmailMessage } from '../services/email';

export function startCronWorker() {
    console.log('Cron worker started, polling every 1 minute...');

    cron.schedule('* * * * *', async () => {
        try {
            console.log('Polling notifications...');

            // Atomic claim: UPDATE pending → processing.
            // Only the instance that wins this race processes the notification.
            // Any other concurrent instance (zero-downtime deploy overlap) finds 0 rows.
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
                let finalStatus = 'failed';
                let errorLog = 'Channel delivery failed';
                let retryable = false;

                try {
                    console.log(`Processing [${notif.id}] via ${notif.channel} for ${notif.destination}`);

                    if (notif.channel === 'whatsapp') {
                        await sendWhatsAppMessage(notif.destination, notif.body);
                        finalStatus = 'sent';
                    } else if (notif.channel === 'email') {
                        const ok = await sendEmailMessage(
                            notif.destination,
                            notif.title || 'CineSync Reminder',
                            notif.body
                        );
                        finalStatus = ok ? 'sent' : 'failed';
                    } else {
                        console.error('Unknown channel:', notif.channel);
                        errorLog = `Unknown channel: ${notif.channel}`;
                    }
                } catch (e: any) {
                    console.error(`Error sending [${notif.id}]:`, e.message);
                    errorLog = e.message;
                    // Transient errors (conflict 440, connection failure) → retry later
                    retryable = isRetryableError(e);
                }

                if (retryable) {
                    // Reset to pending so the next cron cycle will retry
                    console.log(`[${notif.id}] Transient error — resetting to pending for retry.`);
                    await supabase
                        .from('notifications')
                        .update({ status: 'pending', updated_at: new Date().toISOString() })
                        .eq('id', notif.id);
                } else {
                    await supabase
                        .from('notifications')
                        .update({
                            status: finalStatus,
                            error_log: finalStatus === 'sent' ? null : errorLog,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', notif.id);

                    console.log(`Notification [${notif.id}] marked as ${finalStatus}.`);
                }
            }
        } catch (e) {
            console.error('Cron job crashed:', e);
        }
    });
}
