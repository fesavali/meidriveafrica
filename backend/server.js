const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// M-PESA CREDENTIALS (from your dashboard)
// =====================================================
const MPESA_CONFIG = {
    consumerKey: '9b0oJej33MSHlgiSmNAxRlrCfceBAQOze',
    consumerSecret: 'hXZJU1IPDrbCjRZJ',
    shortCode: '4095377',
    passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    
    // Environment: 'sandbox' or 'production'
    environment: 'sandbox',
    
    // Callback URLs (replace with your actual domain)
    callbackUrl: process.env.CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback',
    timeoutUrl: process.env.TIMEOUT_URL || 'https://your-domain.com/api/mpesa/timeout',
    
    // API URLs
    get apiUrls() {
        const urls = {
            sandbox: {
                auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
                c2bSimulate: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate',
                accountBalance: 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
                transactionStatus: 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query',
                reversal: 'https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request'
            },
            production: {
                auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
                c2bSimulate: 'https://api.safaricom.co.ke/mpesa/c2b/v1/simulate',
                accountBalance: 'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query',
                transactionStatus: 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query',
                reversal: 'https://api.safaricom.co.ke/mpesa/reversal/v1/request'
            }
        };
        return urls[this.environment];
    }
};

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// =====================================================
// M-PESA API CLASS
// =====================================================
class MpesaAPI {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.transactions = new Map(); // In-memory store (use DB in production)
    }

    // Get OAuth Token
    async getAccessToken() {
        // Check if token is still valid
        if (this.accessToken && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
        
        try {
            console.log('🔑 Getting M-Pesa access token...');
            const response = await axios.get(MPESA_CONFIG.apiUrls.auth, {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            });
            
            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
            console.log('✅ Access token obtained successfully');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Error getting access token:', error.response?.data || error.message);
            throw new Error('Failed to get access token');
        }
    }

    // Generate timestamp (YYYYMMDDHHMMSS)
    getTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    // Generate password for STK Push
    getPassword() {
        const timestamp = this.getTimestamp();
        const str = `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`;
        return {
            password: Buffer.from(str).toString('base64'),
            timestamp
        };
    }

    // Format phone number to 254XXXXXXXXX
    formatPhoneNumber(phoneNumber) {
        let formatted = phoneNumber.replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.substring(1);
        } else if (formatted.startsWith('+')) {
            formatted = formatted.substring(1);
        } else if (!formatted.startsWith('254') && formatted.length === 9) {
            formatted = '254' + formatted;
        }
        return formatted;
    }

    // STK Push (Lipa Na M-Pesa)
    async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
        try {
            const token = await this.getAccessToken();
            const { password, timestamp } = this.getPassword();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const requestBody = {
                BusinessShortCode: MPESA_CONFIG.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(parseFloat(amount)),
                PartyA: formattedPhone,
                PartyB: MPESA_CONFIG.shortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: MPESA_CONFIG.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc || 'Payment for MEI Drive Africa'
            };

            console.log('📤 Sending STK Push request:', {
                phone: formattedPhone,
                amount,
                accountReference
            });

            const response = await axios.post(
                MPESA_CONFIG.apiUrls.stkPush,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ STK Push response:', response.data);

            // Store transaction
            const checkoutRequestID = response.data.CheckoutRequestID;
            this.transactions.set(checkoutRequestID, {
                checkoutRequestID,
                phoneNumber: formattedPhone,
                amount,
                accountReference,
                transactionDesc,
                status: 'pending',
                timestamp: new Date().toISOString(),
                merchantRequestID: response.data.MerchantRequestID
            });

            return {
                success: true,
                checkoutRequestID,
                responseCode: response.data.ResponseCode,
                responseDesc: response.data.ResponseDescription
            };
        } catch (error) {
            console.error('❌ STK Push error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || { errorMessage: error.message }
            };
        }
    }

    // Query STK Push Status
    async queryStatus(checkoutRequestID) {
        try {
            const token = await this.getAccessToken();
            const { password, timestamp } = this.getPassword();

            const requestBody = {
                BusinessShortCode: MPESA_CONFIG.shortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            };

            const response = await axios.post(
                MPESA_CONFIG.apiUrls.stkQuery,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update transaction status
            const transaction = this.transactions.get(checkoutRequestID);
            if (transaction) {
                transaction.status = response.data.ResultCode === '0' ? 'completed' : 'failed';
                transaction.resultCode = response.data.ResultCode;
                transaction.resultDesc = response.data.ResultDesc;
                this.transactions.set(checkoutRequestID, transaction);
            }

            return {
                success: true,
                status: response.data.ResultCode === '0' ? 'completed' : 'failed',
                resultCode: response.data.ResultCode,
                resultDesc: response.data.ResultDesc,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Query error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // C2B Simulate (for testing)
    async c2bSimulate(phoneNumber, amount, accountReference) {
        try {
            const token = await this.getAccessToken();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const requestBody = {
                ShortCode: MPESA_CONFIG.shortCode,
                CommandID: 'CustomerPayBillOnline',
                Amount: Math.round(parseFloat(amount)),
                Msisdn: formattedPhone,
                BillRefNumber: accountReference
            };

            const response = await axios.post(
                MPESA_CONFIG.apiUrls.c2bSimulate,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ C2B Simulation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Get transaction by CheckoutRequestID
    getTransaction(checkoutRequestID) {
        return this.transactions.get(checkoutRequestID) || null;
    }

    // Get all transactions
    getAllTransactions() {
        return Array.from(this.transactions.values()).reverse();
    }

    // Handle callback from M-Pesa
    handleCallback(callbackData) {
        console.log('📞 M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));
        
        if (callbackData.Body && callbackData.Body.stkCallback) {
            const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData.Body.stkCallback;
            
            const transaction = this.transactions.get(CheckoutRequestID);
            if (transaction) {
                transaction.status = ResultCode === '0' ? 'completed' : 'failed';
                transaction.resultCode = ResultCode;
                transaction.resultDesc = ResultDesc;
                transaction.callbackMetadata = CallbackMetadata;
                transaction.completedAt = new Date().toISOString();
                this.transactions.set(CheckoutRequestID, transaction);
                
                console.log(`✅ Transaction ${CheckoutRequestID} updated: ${transaction.status}`);
                
                // Extract payment details if successful
                if (ResultCode === '0' && CallbackMetadata) {
                    const metadata = {};
                    CallbackMetadata.Item.forEach(item => {
                        metadata[item.Name] = item.Value;
                    });
                    transaction.paymentDetails = metadata;
                    console.log('💰 Payment details:', metadata);
                }
            }
        }
        
        return { ResultCode: 0, ResultDesc: 'Success' };
    }
}

// Initialize M-Pesa API
const mpesa = new MpesaAPI();

// =====================================================
// API ROUTES
// =====================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'MEI Drive Africa M-Pesa Integration',
        environment: MPESA_CONFIG.environment,
        paybill: MPESA_CONFIG.shortCode,
        timestamp: new Date().toISOString()
    });
});

// M-Pesa configuration (public info only)
app.get('/api/mpesa/config', (req, res) => {
    res.json({
        paybill: MPESA_CONFIG.shortCode,
        environment: MPESA_CONFIG.environment,
        supportedAmounts: {
            min: 1,
            max: 150000
        }
    });
});

// Initiate STK Push payment
app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validation
    if (!phoneNumber || !amount || !accountReference) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: phoneNumber, amount, accountReference'
        });
    }

    if (amount < 1 || amount > 150000) {
        return res.status(400).json({
            success: false,
            error: 'Amount must be between 1 and 150,000 KES'
        });
    }

    const result = await mpesa.stkPush(phoneNumber, amount, accountReference, transactionDesc);

    if (result.success) {
        res.json({
            success: true,
            message: 'STK Push sent successfully. Check your phone for the M-Pesa prompt.',
            checkoutRequestID: result.checkoutRequestID,
            responseCode: result.responseCode,
            responseDesc: result.responseDesc
        });
    } else {
        res.status(500).json({
            success: false,
            error: result.error?.errorMessage || result.error || 'Failed to process payment'
        });
    }
});

// Query transaction status
app.post('/api/mpesa/status', async (req, res) => {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
        return res.status(400).json({
            success: false,
            error: 'CheckoutRequestID is required'
        });
    }

    const result = await mpesa.queryStatus(checkoutRequestID);

    if (result.success) {
        res.json({
            success: true,
            status: result.status,
            resultCode: result.resultCode,
            resultDesc: result.resultDesc,
            data: result.data
        });
    } else {
        res.status(500).json({
            success: false,
            error: result.error
        });
    }
});

// Get transaction details
app.get('/api/mpesa/transaction/:checkoutRequestID', (req, res) => {
    const { checkoutRequestID } = req.params;
    const transaction = mpesa.getTransaction(checkoutRequestID);

    if (transaction) {
        res.json({
            success: true,
            transaction
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Transaction not found'
        });
    }
});

// Get all transactions
app.get('/api/mpesa/transactions', (req, res) => {
    const transactions = mpesa.getAllTransactions();
    res.json({
        success: true,
        count: transactions.length,
        transactions
    });
});

// M-Pesa Callback URL (M-Pesa sends confirmation here)
app.post('/api/mpesa/callback', (req, res) => {
    const result = mpesa.handleCallback(req.body);
    res.json(result);
});

// M-Pesa Timeout URL
app.post('/api/mpesa/timeout', (req, res) => {
    console.log('⏰ M-Pesa Timeout received:', req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// C2B Simulate (for testing purposes only)
app.post('/api/mpesa/c2b-simulate', async (req, res) => {
    const { phoneNumber, amount, accountReference } = req.body;

    if (!phoneNumber || !amount || !accountReference) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    const result = await mpesa.c2bSimulate(phoneNumber, amount, accountReference);

    if (result.success) {
        res.json({
            success: true,
            message: 'C2B simulation completed',
            data: result.data
        });
    } else {
        res.status(500).json({
            success: false,
            error: result.error
        });
    }
});

// =====================================================
// STATIC FILE SERVING & SPA ROUTING
// =====================================================

// Serve static files
app.use(express.static(__dirname));

// SPA routing - serve index.html for unknown routes (except API)
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MEI Drive Africa</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    h1 { color: #1a472a; }
                </style>
            </head>
            <body>
                <h1>🚗 MEI Drive Africa</h1>
                <p>M-Pesa Payment Server is running</p>
                <p>API Endpoint: <a href="/api/health">/api/health</a></p>
            </body>
            </html>
        `);
    }
});

// =====================================================
// ERROR HANDLING
// =====================================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════════════╗
    ║     🚗 MEI DRIVE AFRICA - M-PESA SERVER 🚗         ║
    ╠════════════════════════════════════════════════════╣
    ║  Server: http://localhost:${PORT}                    ║
    ║  Environment: ${MPESA_CONFIG.environment.padEnd(25)}║
    ║  Paybill: ${MPESA_CONFIG.shortCode.padEnd(25)}║
    ║                                                    ║
    ║  📡 API Endpoints:                                 ║
    ║  POST  /api/mpesa/stkpush     - Initiate payment   ║
    ║  POST  /api/mpesa/status      - Check status       ║
    ║  GET   /api/mpesa/transactions - All transactions  ║
    ║  POST  /api/mpesa/callback    - M-Pesa callback    ║
    ║                                                    ║
    ║  ✅ Server is ready to process payments           ║
    ╚════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
