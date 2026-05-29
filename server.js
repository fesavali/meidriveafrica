import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://www.meidriveafrica.com'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'MEI DRIVE AFRICA API is running',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
    });
});

// M-Pesa routes
app.use('/api/payments', paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚗 MEI DRIVE AFRICA - PRODUCTION BACKEND                     ║
║                                                                   ║
║     Status: ✅ RUNNING                                            ║
║     Port: ${PORT}                                                   ║
║     Environment: PRODUCTION                                       ║
║     M-Pesa: LIVE MODE                                             ║
║                                                                   ║
║     Endpoints:                                                    ║
║     • Health:  GET  /api/health                                   ║
║     • M-Pesa:   GET  /api/payments/mpesa/test                     ║
║     • Initiate: POST /api/payments/mpesa/initiate                 ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
});