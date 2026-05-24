// server.js - M-Pesa STK Push Integration for MEI Drive Africa
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// CONFIGURATION
// ============================================================
const config = {
    // Production Credentials
    consumerKey: process.env.MPESA_CONSUMER_KEY || 'LI2gcJZEheN8qCfXHEXV4gdYXvOBHVnv',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'aGGo8AuPJVpsZLcs',
    shortCode: process.env.MPESA_SHORTCODE || '4095377',
    passkey: process.env.MPESA_PASSKEY || '7eb17a031bdfd5b4251863a1ddb72c5b9cd14f3385aa6a258c1442a0116e8277',
    
    // Environment: 'production' or 'sandbox'
    environment: process.env.NODE_ENV || 'production',
    
    // Callback URLs
    callbackUrl: process.env.CALLBACK_URL || 'https://your-domain.com/api/callback',
    timeoutUrl: process.env.TIMEOUT_URL || 'https://your-domain.com/api/timeout',
    
    // API URLs
    apiUrls: {
        sandbox: {
            auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
        },
        production: {
            auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
        }
    }
};

const currentApi = config.apiUrls[config.environment];

// ============================================================
// Token Management (with caching)
// ============================================================
let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
        console.log('Using cached token');
        return accessToken;
    }

    console.log('Fetching new access token...');
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(currentApi.auth, {
            headers: { Authorization: `Basic ${auth}` }
        });

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        console.log('Token obtained successfully');
        return accessToken;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw new Error('Failed to get access token');
    }
}

// ============================================================
// Helper Functions
// ============================================================
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

function getPassword(shortCode, passkey, timestamp) {
    const str = `${shortCode}${passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
}

function formatPhoneNumber(phone) {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('+254')) {
        formatted = '254' + formatted.substring(4);
    } else if (formatted.length === 9) {
        formatted = '254' + formatted;
    }
    return formatted;
}

// ============================================================
// STK Push (Lipa Na M-Pesa)
// ============================================================
async function stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
        const token = await getAccessToken();
        const timestamp = getTimestamp();
        const password = getPassword(config.shortCode, config.passkey, timestamp);
        const formattedPhone = formatPhoneNumber(phoneNumber);

        const requestBody = {
            BusinessShortCode: config.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(parseFloat(amount)),
            PartyA: formattedPhone,
            PartyB: config.shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: config.callbackUrl,
            AccountReference: accountReference.slice(0, 12),
            TransactionDesc: transactionDesc.slice(0, 13)
        };

        console.log('Initiating STK Push:', {
            phone: formattedPhone,
            amount: requestBody.Amount,
            accountRef: accountReference,
            environment: config.environment
        });

        const response = await axios.post(currentApi.stkPush, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('STK Push Response:', response.data);
        return {
            success: true,
            data: response.data,
            checkoutRequestID: response.data.CheckoutRequestID
        };
    } catch (error) {
        console.error('STK Push Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// ============================================================
// Query STK Push Status
// ============================================================
async function queryStatus(checkoutRequestID) {
    try {
        const token = await getAccessToken();
        const timestamp = getTimestamp();
        const password = getPassword(config.shortCode, config.passkey, timestamp);

        const requestBody = {
            BusinessShortCode: config.shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID
        };

        const response = await axios.post(currentApi.stkQuery, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Query Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// ============================================================
// API Routes
// ============================================================

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'M-Pesa Integration Server Running',
        environment: config.environment,
        shortCode: config.shortCode,
        timestamp: new Date().toISOString()
    });
});

// STK Push endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validation
    if (!phoneNumber || !amount) {
        return res.status(400).json({
            success: false,
            error: 'Phone number and amount are required'
        });
    }

    if (amount < 1 || amount > 150000) {
        return res.status(400).json({
            success: false,
            error: 'Amount must be between 1 and 150,000 KES'
        });
    }

    const result = await stkPush(
        phoneNumber,
        amount,
        accountReference || 'Course Payment',
        transactionDesc || 'Payment for Course'
    );

    if (!result.success) {
        return res.status(400).json(result);
    }

    if (result.data.ResponseCode !== '0') {
        return res.status(400).json({
            success: false,
            error: result.data.ResponseDescription,
            responseCode: result.data.ResponseCode
        });
    }

    res.json({
        success: true,
        message: 'STK Push sent. Check your phone for the M-Pesa prompt.',
        checkoutRequestID: result.data.CheckoutRequestID,
        customerMessage: result.data.CustomerMessage
    });
});

// Query status endpoint
app.post('/api/mpesa/query', async (req, res) => {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
        return res.status(400).json({
            success: false,
            error: 'CheckoutRequestID is required'
        });
    }

    const result = await queryStatus(checkoutRequestID);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json({
        success: true,
        data: result.data
    });
});

// Callback endpoint (M-Pesa will call this)
app.post('/api/callback', async (req, res) => {
    console.log('Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
        // Payment successful
        const checkoutRequestID = stkCallback.CheckoutRequestID;
        const mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
            item => item.Name === 'MpesaReceiptNumber'
        )?.Value;
        const amount = stkCallback.CallbackMetadata?.Item?.find(
            item => item.Name === 'Amount'
        )?.Value;

        console.log(`✅ Payment successful!`);
        console.log(`   Receipt: ${mpesaReceiptNumber}`);
        console.log(`   Amount: KES ${amount}`);
        console.log(`   Checkout ID: ${checkoutRequestID}`);

        // Here you would:
        // 1. Update your database
        // 2. Enroll user in course
        // 3. Send confirmation email/SMS
    } else {
        // Payment failed
        console.log(`❌ Payment failed: ${stkCallback.ResultDesc}`);
    }

    // Always respond with success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// Timeout endpoint
app.post('/api/timeout', (req, res) => {
    console.log('Timeout received:', req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     M-Pesa STK Push Server - MEI Drive Africa           ║
╠══════════════════════════════════════════════════════════╣
║  Environment: ${config.environment.padEnd(40)}║
║  Shortcode:   ${config.shortCode.padEnd(40)}║
║  Port:        ${PORT.toString().padEnd(40)}║
║  Status:      Running ✓                                 ║
╚══════════════════════════════════════════════════════════╝
    `);
});
