import { Resend } from 'resend';

const resendToken = process.env.RESEND_API_KEY;
const resend = resendToken ? new Resend(resendToken) : null;

export async function sendEmailMessage(toEmail: string, title: string, text: string): Promise<boolean> {
    if (!resend) {
        console.error('Resend API Key is missing. Email not sent.');
        return false;
    }
    try {
        const data = await resend.emails.send({
            from: 'CineSync <onboarding@resend.dev>', // Update with verified domain in production
            to: [toEmail],
            subject: `⏰ CineSync Lembrete: ${title}`,
            text: text,
            // html: `<p>${text.replace(/\n/g, '<br>')}</p>` // You can upgrade this
        });
        
        console.log(`Email sent to ${toEmail}:`, data);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}
