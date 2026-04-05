import express from 'express';
import cors from 'cors';
import { connectToWhatsApp, latestQrCode } from './services/whatsapp';
import { startCronWorker } from './workers/cronJob';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main healthcheck endpoints used by platforms like Render
app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req: any, res: any) => {
    res.send('CineSync Notifier Microservice is running');
});

// Endpoint to display QR Code for Baileys auth
app.get('/api/qrcode', (req: any, res: any) => {
    if (latestQrCode) {
        res.send(`
            <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 50px;">
                <h2>WhatsApp Authentication</h2>
                <p>Scan this QR code with your WhatsApp app (Linked Devices).</p>
                <img src="${latestQrCode}" alt="QR Code" style="border: 2px solid #ccc; padding: 10px; border-radius: 10px;" />
            </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 50px;">
                <h2>WhatsApp Authentication</h2>
                <p>Status: connected, logging in, or not ready.</p>
                <p>If you are already connected, the QR Code is no longer necessary. Keep refreshing if the service just started.</p>
            </body>
            </html>
        `);
    }
});

// Start services
function bootstrap() {
    console.log('Initializing CineSync Notifier...');

    // FIX: Start cron worker FIRST — independently of WhatsApp connection state.
    // This ensures pending notifications are polled even if WhatsApp is reconnecting.
    startCronWorker();

    // Listen for HTTP requests (QR code page, healthcheck)
    app.listen(port, () => {
        console.log(`Microservice listening on port ${port}`);
        console.log(`To scan QR Code, visit http://localhost:${port}/api/qrcode`);
    });

    // Connect WhatsApp in background — non-blocking
    connectToWhatsApp().catch(console.error);
}

bootstrap();
