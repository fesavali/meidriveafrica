// config/mpesa.js
// REAL PRODUCTION - MEI DRIVE AFRICA
// LIVE M-Pesa Configuration

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// =====================================================
// REAL PRODUCTION M-PESA CONFIGURATION
// =====================================================
export const MPESA_CONFIG = {
    // Production credentials from Safaricom Developer Portal
    consumerKey: process.env.MPESA_CONSUMER_KEY || 'LI2gcJZEheN8qCfXHEXV4gdYxVOBHVNv',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'aGG0s8AuPJVpsZLcs',
    passkey: process.env.MPESA_PASSKEY || '7eb17a031bdfd5b4251863a1ddb72c5b9cd14f3385aa6a258c1442a0116e8277',
    shortCode: process.env.MPESA_SHORTCODE || '4095377',
    
    // Environment: 'production' for LIVE MONEY
    environment: process.env.MPESA_ENVIRONMENT || 'production',
    
    // Callback URLs - Your Render.com backend
    callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://meidriveafrica-backend.onrender.com/api/payments/mpesa/callback',
    timeoutUrl: process.env.MPESA_TIMEOUT_URL || 'https://meidriveafrica-backend.onrender.com/api/payments/mpesa/timeout',
    resultUrl: process.env.MPESA_RESULT_URL || 'https://meidriveafrica-backend.onrender.com/api/payments/mpesa/result',
    confirmationUrl: process.env.MPESA_CONFIRMATION_URL || 'https://meidriveafrica-backend.onrender.com/api/payments/mpesa/confirmation',
    validationUrl: process.env.MPESA_VALIDATION_URL || 'https://meidriveafrica-backend.onrender.com/api/payments/mpesa/validation'
};

// =====================================================
// API URLs for Production vs Sandbox
// =====================================================
const API_URLS = {
    sandbox: {
        base: 'https://sandbox.safaricom.co.ke',
        auth: '/oauth/v1/generate?grant_type=client_credentials',
        stkPush: '/mpesa/stkpush/v1/processrequest',
        stkQuery: '/mpesa/stkpushquery/v1/query',
        registerUrl: '/mpesa/c2b/v1/registerurl',
        simulateC2B: '/mpesa/c2b/v1/simulate',
        accountBalance: '/mpesa/accountbalance/v1/query',
        transactionStatus: '/mpesa/transactionstatus/v1/query',
        reversal: '/mpesa/reversal/v1/request'
    },
    production: {
        base: 'https://api.safaricom.co.ke',
        auth: '/oauth/v1/generate?grant_type=client_credentials',
        stkPush: '/mpesa/stkpush/v1/processrequest',
        stkQuery: '/mpesa/stkpushquery/v1/query',
        registerUrl: '/mpesa/c2b/v1/registerurl',
        simulateC2B: '/mpesa/c2b/v1/simulate',
        accountBalance: '/mpesa/accountbalance/v1/query',
        transactionStatus: '/mpesa/transactionstatus/v1/query',
        reversal: '/mpesa/reversal/v1/request'
    }
};

// Get current environment config
const env = MPESA_CONFIG.environment === 'production' ? 'production' : 'sandbox';
const currentApiUrls = API_URLS[env];

// Base URL for API calls
const baseUrl = currentApiUrls.base;

// =====================================================
// GET M-PESA ACCESS TOKEN
// =====================================================
export async function getMpesaToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    console.log(`🔑 Getting M-Pesa ${MPESA_CONFIG.environment.toUpperCase()} access token...`);
    console.log(`⚠️ ${MPESA_CONFIG.environment === 'production' ? 'REAL MONEY MODE - Live transactions' : 'SANDBOX MODE - Testing'}`);
    
    try {
        const response = await axios.get(`${baseUrl}${currentApiUrls.auth}`, {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('❌ M-Pesa Token Error:', error.response?.data || error.message);
        throw new Error(`Failed to get M-Pesa access token: ${error.response?.data?.errorMessage || error.message}`);
    }
}

// =====================================================
// GENERATE PASSWORD FOR STK PUSH
// =====================================================
export function generatePassword(timestamp) {
    const str = `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`;
    const password = Buffer.from(str).toString('base64');
    return password;
}

// =====================================================
// FORMAT PHONE NUMBER TO INTERNATIONAL FORMAT (254XXXXXXXXX)
// =====================================================
export function formatPhoneNumber(phone) {
    let formatted = phone.toString().replace(/\D/g, '');
    
    if (formatted.startsWith('0')) {
        formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('+')) {
        formatted = formatted.slice(1);
    } else if (!formatted.startsWith('254')) {
        formatted = '254' + formatted;
    }
    
    console.log(`📱 Formatted phone: ${formatted}`);
    return formatted;
}

// =====================================================
// GENERATE TIMESTAMP FOR M-PESA REQUEST
// =====================================================
export function generateTimestamp() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    return timestamp;
}

// =====================================================
// INITIATE STK PUSH (Lipa Na M-Pesa Online)
// =====================================================
export async function initiateStkPush(phoneNumber, amount, accountReference, transactionDesc, userId, courseId) {
    console.log('💰💰💰 INITIATING M-PESA STK PUSH 💰💰💰');
    console.log(`Environment: ${MPESA_CONFIG.environment.toUpperCase()}`);
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Amount: KES ${amount}`);
    console.log(`Course ID: ${courseId}`);
    
    // Validate minimum amount (49 KES for production)
    const MINIMUM_AMOUNT = 49;
    if (amount < MINIMUM_AMOUNT) {
        throw new Error(`Minimum payment amount is ${MINIMUM_AMOUNT} KES`);
    }
    
    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const stkPushRequest = {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: accountReference || `MEI-${courseId}-${Date.now()}`,
        TransactionDesc: transactionDesc?.substring(0, 36) || 'Course Enrollment'
    };
    
    console.log('📤 Sending STK Push request to Safaricom...');
    
    const response = await axios.post(`${baseUrl}${currentApiUrls.stkPush}`, stkPushRequest, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log('✅ STK Push Response:', response.data);
    console.log('⚠️ Customer will receive STK push on their phone');
    
    return response.data;
}

// =====================================================
// QUERY TRANSACTION STATUS
// =====================================================
export async function queryTransactionStatus(checkoutRequestId) {
    console.log(`🔍 Querying transaction status for: ${checkoutRequestId}`);
    
    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    
    const queryRequest = {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
    };
    
    const response = await axios.post(`${baseUrl}${currentApiUrls.stkQuery}`, queryRequest, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log('Status query response:', response.data);
    return response.data;
}

// =====================================================
// REGISTER C2B URLS (For Paybill integration)
// =====================================================
export async function registerC2BUrls() {
    console.log('📝 Registering C2B URLs...');
    
    const token = await getMpesaToken();
    
    const registerRequest = {
        ShortCode: MPESA_CONFIG.shortCode,
        ResponseType: 'Completed',
        ConfirmationURL: MPESA_CONFIG.confirmationUrl,
        ValidationURL: MPESA_CONFIG.validationUrl
    };
    
    const response = await axios.post(`${baseUrl}${currentApiUrls.registerUrl}`, registerRequest, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log('C2B Registration response:', response.data);
    return response.data;
}

// =====================================================
// SIMULATE C2B PAYMENT (Sandbox only)
// =====================================================
export async function simulateC2BPayment(phoneNumber, amount, commandId = 'CustomerPayBillOnline') {
    if (MPESA_CONFIG.environment === 'production') {
        throw new Error('C2B simulation is only available in sandbox mode');
    }
    
    console.log('🎮 Simulating C2B payment (Sandbox only)...');
    
    const token = await getMpesaToken();
    
    const simulateRequest = {
        ShortCode: MPESA_CONFIG.shortCode,
        CommandID: commandId,
        Amount: Math.round(amount),
        Msisdn: formatPhoneNumber(phoneNumber),
        BillRefNumber: 'MEI-DRIVE'
    };
    
    const response = await axios.post(`${baseUrl}${currentApiUrls.simulateC2B}`, simulateRequest, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.data;
}

// =====================================================
// CHECK ACCOUNT BALANCE
// =====================================================
export async function checkAccountBalance() {
    console.log('💰 Checking account balance...');
    
    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    
    const balanceRequest = {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        QueueTimeOutURL: MPESA_CONFIG.timeoutUrl,
        ResultURL: MPESA_CONFIG.resultUrl,
        Remarks: 'Balance Check',
        Initiator: 'MEI Drive',
        SecurityCredential: 'not implemented'
    };
    
    // Note: This requires an initiator name and security credential
    console.log('⚠️ Account balance query requires security credential setup');
    return { success: false, message: 'Security credential required' };
}

// =====================================================
// GET CONFIGURATION INFO
// =====================================================
export function getConfig() {
    return {
        environment: MPESA_CONFIG.environment,
        shortCode: MPESA_CONFIG.shortCode,
        callbackUrl: MPESA_CONFIG.callbackUrl,
        isProduction: MPESA_CONFIG.environment === 'production',
        warning: MPESA_CONFIG.environment === 'production' ? '⚠️ REAL MONEY WILL BE DEDUCTED' : '🧪 Sandbox mode - No real money'
    };
}

// =====================================================
// EXPORTS
// =====================================================
export default {
    MPESA_CONFIG,
    getMpesaToken,
    generatePassword,
    generateTimestamp,
    formatPhoneNumber,
    initiateStkPush,
    queryTransactionStatus,
    registerC2BUrls,
    simulateC2BPayment,
    checkAccountBalance,
    getConfig
};
