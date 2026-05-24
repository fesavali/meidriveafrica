// server.js - Complete M-Pesa Integration for MEI DRIVE AFRICA
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. CORS CONFIGURATION (Fix #19)
// ============================================================
const corsOrigins = (process.env.CORS_ORIGIN || 'https://meidriveafrica.com,http://localhost:3000,http://localhost:5500').split(',');
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 2. SUPABASE CONNECTION (Fix #20)
// ============================================================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ============================================================
// 3. M-PESA CONFIGURATION (Fix #6)
// ============================================================
const config = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    environment: process.env.MPESA_ENVIRONMENT || 'production',
    callbackUrl: process.env.MPESA_CALLBACK_URL
};

const apiUrls = {
    production: {
        auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    },
    sandbox: {
        auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    }
};

const currentApi = apiUrls[config.environment];

// ============================================================
// 4. TOKEN CACHING (Fix #7)
// ============================================================
let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
        return accessToken;
    }

    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    
    const response = await axios.get(currentApi.auth, {
        headers: { Authorization: `Basic ${auth}` }
    });
    
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
}

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================
function getTimestamp() {
    const d = new Date();
    return d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0') +
        String(d.getSeconds()).padStart(2, '0');
}

function formatPhoneNumber(phone) {
    // Fix #11: Format 0703738707 → 254703738707
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('+254')) {
        formatted = '254' + formatted.substring(4);
    }
    return formatted;
}

// ============================================================
// 6. DATABASE FUNCTIONS (Fix #17, #18, #20)
// ============================================================
async function savePayment(userId, phoneNumber, amount, courseName, checkoutRequestId) {
    const { data, error } = await supabase
        .from('payments')
        .insert({
            user_id: userId,
            phone_number: phoneNumber,
            amount: amount,
            course_name: courseName,
            checkout_request_id: checkoutRequestId,
            status: 'pending',
            created_at: new Date().toISOString()
        });
    
    if (error) console.error('Save payment error:', error);
    return { data, error };
}

async function updatePaymentStatus(checkoutRequestId, status, mpesaReceipt = null) {
    const updateData = { status };
    if (mpesaReceipt) updateData.mpesa_receipt = mpesaReceipt;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    
    const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('checkout_request_id', checkoutRequestId);
    
    return { data, error };
}

async function enrollUserInCourse(userId, courseName, mpesaReceipt) {
    const { data, error } = await supabase
        .from('user_enrollments')
        .insert({
            user_id: userId,
            course_name: courseName,
            payment_receipt: mpesaReceipt,
            enrolled_at: new Date().toISOString()
        });
    
    return { data, error };
}

// ============================================================
// 7. STK PUSH FUNCTION (Fix #8)
// ============================================================
async function stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${config.shortCode}${config.passkey}${timestamp}`).toString('base64');
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const requestBody = {
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: config.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: accountReference.slice(0, 12),
        TransactionDesc: transactionDesc.slice(0, 13)
    };

    const response = await axios.post(currentApi.stkPush, requestBody, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    return response.data;
}

// ============================================================
// 8. API ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'OK', service: 'MEI Drive Africa API', environment: config.environment });
});

// STK Push Route (Fix #2, #3)
app.post('/api/mpesa/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, accountReference, transactionDesc, userId } = req.body;
        
        // Fix #12: Input Validation
        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: 'Phone number is required' });
        }
        if (!amount || amount < 10 || amount > 150000) {
            return res.status(400).json({ success: false, error: 'Amount must be between 10 and 150,000 KES' });
        }
        if (!accountReference) {
            return res.status(400).json({ success: false, error: 'Course name is required' });
        }
        
        // Format phone for display
        const displayPhone = phoneNumber;
        const formattedPhone = formatPhoneNumber(phoneNumber);
        
        const result = await stkPush(phoneNumber, amount, accountReference, transactionDesc || 'Course Payment');
        
        if (result.ResponseCode !== '0') {
            return res.status(400).json({ success: false, error: result.ResponseDescription });
        }
        
        // Save to database
        if (userId) {
            await savePayment(userId, formattedPhone, amount, accountReference, result.CheckoutRequestID);
        }
        
        res.json({
            success: true,
            message: 'STK Push sent! Check your phone.',
            checkoutRequestID: result.CheckoutRequestID
        });
    } catch (error) {
        console.error('STK Push error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.response?.data?.errorMessage || error.message });
    }
});

// Callback Route (Fix #9, #10)
app.post('/api/mpesa/callback', async (req, res) => {
    console.log('Callback received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
        const checkoutId = stkCallback.CheckoutRequestID;
        const mpesaReceipt = stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
        const amount = stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
        
        console.log(`✅ Payment successful! Receipt: ${mpesaReceipt}, Amount: KES ${amount}`);
        
        // Update payment status
        await updatePaymentStatus(checkoutId, 'completed', mpesaReceipt);
        
        // Get payment to enroll user (Fix #18)
        const { data: payment } = await supabase
            .from('payments')
            .select('user_id, course_name')
            .eq('checkout_request_id', checkoutId)
            .single();
        
        if (payment && payment.user_id) {
            await enrollUserInCourse(payment.user_id, payment.course_name, mpesaReceipt);
            console.log(`✅ User ${payment.user_id} enrolled in ${payment.course_name}`);
        }
    } else {
        console.log(`❌ Payment failed: ${stkCallback.ResultDesc}`);
        await updatePaymentStatus(stkCallback.CheckoutRequestID, 'failed');
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 MEI Drive Africa API running on port ${PORT}`);
    console.log(`📡 Environment: ${config.environment}`);
    console.log(`🏦 Shortcode: ${config.shortCode}\n`);
});
