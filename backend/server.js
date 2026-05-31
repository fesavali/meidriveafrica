import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const BACKEND_URL = process.env.BACKEND_URL || 'https://meidriveafrica-backend.onrender.com';

// M-Pesa Credentials - PRODUCTION (REAL MONEY) - CORRECTED
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'LI2gcJZEheN8qCfXHEXV4gdYXvOBHVnv';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'aGGo8AuPJVpsZLcs';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '7eb17a031bdfd5b4251863a1ddb72c5b9cd14f3385aa6a258c1442a0116e8277';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '4095377';
const MPESA_CALLBACK_URL = `${BACKEND_URL}/api/payments/mpesa/callback`;

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function getMpesaAccessToken() {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    console.log('🔑 Attempting to get M-Pesa token...');
    console.log('Consumer Key (first 10 chars):', MPESA_CONSUMER_KEY.substring(0, 10) + '...');
    
    try {
        const response = await axios.get(
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { 
                headers: { Authorization: `Basic ${auth}` }, 
                timeout: 30000 
            }
        );
        
        if (!response.data.access_token) {
            throw new Error('No access token received from Safaricom');
        }
        
        console.log('✅ M-Pesa access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error getting M-Pesa token:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        throw new Error(`Failed to get M-Pesa token: ${error.response?.data?.errorMessage || error.message}`);
    }
}

// Format phone number for Safaricom (254XXXXXXXXX format)
function formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1);
    } else if (cleaned.length === 9) {
        cleaned = '254' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('254')) {
        cleaned = cleaned;
    } else {
        cleaned = '254' + cleaned;
    }
    
    // Final validation
    if (!cleaned.startsWith('254') || cleaned.length !== 12) {
        throw new Error('Invalid phone number. Must be 12 digits starting with 254');
    }
    
    return cleaned;
}

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'MEI DRIVE AFRICA API is running',
        environment: process.env.NODE_ENV || 'production',
        mpesa_configured: true,
        paybill: MPESA_SHORTCODE
    });
});

app.get('/api/payments/mpesa/test', async (req, res) => {
    try {
        const token = await getMpesaAccessToken();
        res.json({ 
            success: true, 
            message: 'M-Pesa API connection successful',
            paybill: MPESA_SHORTCODE,
            mode: 'PRODUCTION - REAL MONEY',
            warning: '⚠️ Real money will be deducted from customer accounts'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            mode: 'PRODUCTION',
            paybill: MPESA_SHORTCODE
        });
    }
});

// ============================================
// STK PUSH INITIATE - REAL MONEY
// ============================================
app.post('/api/payments/mpesa/initiate', async (req, res) => {
    try {
        let { phoneNumber, amount, courseId, userId, email, accountReference, transactionDesc } = req.body;

        console.log('========================================');
        console.log('📱 STK PUSH INITIATION - REAL MONEY');
        console.log('========================================');
        console.log('Raw Phone:', phoneNumber);
        console.log('Amount:', amount);
        console.log('Course ID:', courseId);
        console.log('User ID:', userId);
        console.log('Email:', email);
        console.log('========================================');

        // Validate inputs
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        if (!amount || amount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount (min 1 KES) is required'
            });
        }

        if (amount > 150000) {
            return res.status(400).json({
                success: false,
                error: 'Amount cannot exceed 150,000 KES'
            });
        }

        // Format phone number correctly
        let formattedPhone;
        try {
            formattedPhone = formatPhoneNumber(phoneNumber);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        console.log('Formatted Phone:', formattedPhone);

        // Get Access Token
        console.log('🔑 Getting access token...');
        const accessToken = await getMpesaAccessToken();
        console.log('✅ Access token obtained');

        // Generate timestamp and password
        const timestamp = getTimestamp();
        const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
        console.log('Timestamp:', timestamp);
        console.log('Password generated');

        // Prepare STK Push request
        const stkRequest = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: MPESA_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: MPESA_CALLBACK_URL,
            AccountReference: accountReference || `C${courseId}`,
            TransactionDesc: transactionDesc || 'MEI DRIVE COURSE'
        };

        console.log('📤 Sending STK Push to Safaricom...');
        console.log('Request:', JSON.stringify(stkRequest, null, 2));

        // Send STK Push
        const stkResponse = await axios.post(
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            stkRequest,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ STK Push Response:', stkResponse.data);
        console.log('========================================');

        // Check if STK Push was successful
        if (stkResponse.data.ResponseCode !== '0') {
            return res.status(400).json({
                success: false,
                error: stkResponse.data.ResponseDescription || 'STK Push failed',
                responseCode: stkResponse.data.ResponseCode
            });
        }

        res.json({
            success: true,
            checkoutRequestID: stkResponse.data.CheckoutRequestID,
            merchantRequestID: stkResponse.data.MerchantRequestID,
            message: 'STK push sent. Check your phone for M-Pesa prompt.',
            warning: '⚠️ REAL MONEY will be deducted from your M-Pesa account',
            paybill: MPESA_SHORTCODE
        });

    } catch (error) {
        console.error('❌ STK PUSH ERROR:');
        console.error('Error message:', error.message);
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('========================================');

        res.status(500).json({
            success: false,
            error: error.response?.data?.errorMessage || error.message,
            details: error.response?.data,
            message: 'Payment initiation failed. Please try again.'
        });
    }
});

// ============================================
// CHECK PAYMENT STATUS
// ============================================
app.post('/api/payments/mpesa/status', async (req, res) => {
    try {
        const { checkoutRequestID } = req.body;

        if (!checkoutRequestID) {
            return res.status(400).json({
                success: false,
                error: 'CheckoutRequestID required'
            });
        }

        console.log(`🔍 Checking payment status for: ${checkoutRequestID}`);

        // Get access token
        const accessToken = await getMpesaAccessToken();
        const timestamp = getTimestamp();
        const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

        const statusResponse = await axios.post(
            'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
            {
                BusinessShortCode: MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const resultCode = statusResponse.data.ResultCode;
        const isCompleted = resultCode === '0';
        const resultDesc = statusResponse.data.ResultDesc;

        console.log(`📊 Status: ${isCompleted ? 'COMPLETED' : 'PENDING'} - ${resultDesc}`);

        res.json({
            success: true,
            status: isCompleted ? 'completed' : 'pending',
            message: resultDesc,
            resultCode: resultCode,
            resultDesc: resultDesc
        });

    } catch (error) {
        console.error('Status check error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            status: 'failed',
            error: error.response?.data?.errorMessage || error.message
        });
    }
});

// ============================================
// M-PESA CALLBACK (Webhook)
// ============================================
app.post('/api/payments/mpesa/callback', (req, res) => {
    console.log('📞 M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    if (Body && Body.stkCallback) {
        const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;

        if (ResultCode === 0) {
            const items = CallbackMetadata?.Item || [];
            const receiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const amount = items.find(item => item.Name === 'Amount')?.Value;
            const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;

            console.log(`✅ PAYMENT SUCCESSFUL!`);
            console.log(`   Receipt: ${receiptNumber}`);
            console.log(`   Amount: KES ${amount}`);
            console.log(`   Phone: ${phoneNumber}`);
            console.log(`   CheckoutID: ${CheckoutRequestID}`);
            console.log(`   Result Description: ${ResultDesc}`);
        } else {
            console.log(`❌ PAYMENT FAILED: ${ResultDesc}`);
            console.log(`   Result Code: ${ResultCode}`);
            console.log(`   CheckoutID: ${CheckoutRequestID}`);
        }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============================================
// ADDITIONAL M-PESA ENDPOINTS
// ============================================
app.post('/api/payments/mpesa/timeout', (req, res) => {
    console.log('⏰ M-Pesa Timeout received:', JSON.stringify(req.body, null, 2));
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

app.post('/api/payments/mpesa/result', (req, res) => {
    console.log('📊 M-Pesa Result received:', JSON.stringify(req.body, null, 2));
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

app.post('/api/payments/mpesa/confirmation', (req, res) => {
    console.log('✅ M-Pesa Confirmation received:', JSON.stringify(req.body, null, 2));
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

app.post('/api/payments/mpesa/validation', (req, res) => {
    console.log('🔐 M-Pesa Validation received:', JSON.stringify(req.body, null, 2));
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============================================
// DEBUG ENDPOINT - Check credentials format
// ============================================
app.get('/api/debug/credentials', (req, res) => {
    res.json({
        consumer_key_length: MPESA_CONSUMER_KEY.length,
        consumer_secret_length: MPESA_CONSUMER_SECRET.length,
        passkey_length: MPESA_PASSKEY.length,
        shortcode: MPESA_SHORTCODE,
        callback_url: MPESA_CALLBACK_URL,
        warning: 'Credentials are configured but may need verification with Safaricom'
    });
});

// ============================================
// ROOT ENDPOINTS
// ============================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MEI DRIVE AFRICA API',
        version: '2.0.0',
        status: 'running',
        paybill: MPESA_SHORTCODE,
        environment: process.env.NODE_ENV || 'production',
        endpoints: [
            'GET  /',
            'GET  /api/health',
            'GET  /api/payments/mpesa/test',
            'GET  /api/debug/credentials',
            'POST /api/payments/mpesa/initiate',
            'POST /api/payments/mpesa/status',
            'POST /api/payments/mpesa/callback'
        ]
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚗 MEI DRIVE AFRICA - M-PESA API SERVER                       ║
║                                                                   ║
║     Status: ✅ RUNNING                                            ║
║     Port: ${PORT}                                                   ║
║     Paybill Number: ${MPESA_SHORTCODE}                              ║
║     Backend URL: ${BACKEND_URL}                                     ║
║     Environment: ${process.env.NODE_ENV || 'production'}            ║
║                                                                   ║
║     ⚠️  WARNING: REAL MONEY WILL BE DEDUCTED!                     ║
║                                                                   ║
║     Test M-Pesa Connection:                                       ║
║     GET ${BACKEND_URL}/api/payments/mpesa/test                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
});

export default app;
