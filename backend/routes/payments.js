import express from 'express';
import axios from 'axios';

const router = express.Router();

// =====================================================
// REAL PRODUCTION M-PESA CREDENTIALS
// From your Safaricom Developer Portal screenshot
// =====================================================
const MPESA_CONSUMER_KEY = 'LI2gcJZEheN8qCfXHEXV4gdYxVOBHVNv';
const MPESA_CONSUMER_SECRET = 'aGG0s8AuPJVpsZLcs';
const MPESA_PASSKEY = '7eb17a031bdfd5b4251863a1ddb72c5b9cd14f3385aa6a258c1442a0116e8277';
const MPESA_SHORTCODE = '4095377';
const ENVIRONMENT = 'production'; // REAL PRODUCTION - LIVE MONEY

// Helper: Get M-Pesa Access Token
async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    // PRODUCTION URL
    const url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    
    console.log('🔑 Getting REAL PRODUCTION M-Pesa access token...');
    console.log('⚠️ This will use LIVE M-Pesa - Real money will be deducted');
    
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Basic ${auth}` }
        });
        console.log('✅ PRODUCTION access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Token error:', error.response?.data || error.message);
        throw new Error(`Failed to get token: ${error.response?.data?.errorMessage || error.message}`);
    }
}

// Helper: Format phone number to 254XXXXXXXXX
function formatPhoneNumber(phone) {
    let cleaned = phone.toString().replace(/\s/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned;
    }
    console.log(`📱 Formatted phone for PRODUCTION: ${cleaned}`);
    return cleaned;
}

// Test endpoint - Check if M-Pesa is connected
router.get('/mpesa/test', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.json({
            success: true,
            message: '✅ PRODUCTION M-Pesa connection successful!',
            environment: 'PRODUCTION - LIVE MONEY',
            shortcode: MPESA_SHORTCODE,
            minimumPayment: 49,
            warning: '⚠️ REAL MONEY will be deducted from customers',
            tokenObtained: !!token
        });
    } catch (error) {
        console.error('Test endpoint error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            environment: 'PRODUCTION'
        });
    }
});

// Initiate STK Push - REAL PRODUCTION
router.post('/mpesa/initiate', async (req, res) => {
    try {
        const { phoneNumber, amount, courseId, courseName, userId } = req.body;
        
        console.log('💰💰💰 REAL PRODUCTION PAYMENT INITIATED 💰💰💰');
        console.log('⚠️ REAL MONEY WILL BE DEDUCTED FROM CUSTOMER');
        console.log('📱 Phone:', phoneNumber);
        console.log('💰 Amount:', amount);
        console.log('📚 Course:', courseName);
        
        // Validate minimum payment (49 KES)
        const MINIMUM_PAYMENT = 49;
        if (amount < MINIMUM_PAYMENT) {
            return res.status(400).json({
                success: false,
                error: `Minimum payment amount is ${MINIMUM_PAYMENT} KES`
            });
        }
        
        if (!phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and amount are required'
            });
        }
        
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const accountRef = `MEI-${courseId || 'COURSE'}-${Date.now()}`;
        
        const token = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
        
        const stkPushRequest = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: MPESA_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: `https://meidriveafrica-backend.onrender.com/api/payments/mpesa/callback`,
            AccountReference: accountRef,
            TransactionDesc: `Payment for ${courseName || 'Course Enrollment'}`
        };
        
        // PRODUCTION URL
        const url = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
        
        const response = await axios.post(url, stkPushRequest, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ PRODUCTION STK Push Response:', response.data);
        console.log('⚠️ Customer will receive STK push on their phone NOW');
        
        res.json({
            success: true,
            message: '✅ STK Push initiated. Customer will receive M-Pesa prompt.',
            checkoutRequestID: response.data.CheckoutRequestID,
            merchantRequestID: response.data.MerchantRequestID,
            responseCode: response.data.ResponseCode,
            responseDescription: response.data.ResponseDescription,
            environment: 'PRODUCTION - REAL MONEY',
            warning: '⚠️ REAL MONEY has been requested from customer'
        });
        
    } catch (error) {
        console.error('❌ PRODUCTION Initiate error:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.errorMessage || 
                           error.response?.data?.ResponseDescription || 
                           'Failed to initiate payment';
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            environment: 'PRODUCTION',
            warning: 'Check M-Pesa credentials and try again'
        });
    }
});

// M-Pesa Callback - REAL PRODUCTION
router.post('/mpesa/callback', async (req, res) => {
    console.log('📞 PRODUCTION Callback received at:', new Date().toISOString());
    console.log('Callback body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { Body } = req.body;
        
        if (Body && Body.stkCallback) {
            const {
                ResultCode,
                ResultDesc,
                CheckoutRequestID,
                CallbackMetadata
            } = Body.stkCallback;
            
            console.log(`PRODUCTION Callback Result: ${ResultCode} - ${ResultDesc}`);
            
            if (ResultCode === 0 && CallbackMetadata?.Item) {
                let receiptNumber = '';
                let amount = 0;
                
                for (const item of CallbackMetadata.Item) {
                    if (item.Name === 'MpesaReceiptNumber') receiptNumber = item.Value;
                    if (item.Name === 'Amount') amount = item.Value;
                }
                
                console.log('✅✅✅ PRODUCTION PAYMENT SUCCESSFUL! ✅✅✅');
                console.log(`Receipt Number: ${receiptNumber}`);
                console.log(`Amount Paid: ${amount}`);
                console.log(`Checkout ID: ${CheckoutRequestID}`);
            } else if (ResultCode !== 0) {
                console.log('❌ PRODUCTION PAYMENT FAILED:', ResultDesc);
            }
        }
        
        // Always acknowledge receipt to M-Pesa
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
        
    } catch (error) {
        console.error('Callback processing error:', error);
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
});

// Check transaction status - REAL PRODUCTION
router.post('/mpesa/status', async (req, res) => {
    try {
        const { checkoutRequestID } = req.body;
        
        if (!checkoutRequestID) {
            return res.status(400).json({
                success: false,
                error: 'Missing checkoutRequestID'
            });
        }
        
        console.log('🔍 Checking PRODUCTION status for:', checkoutRequestID);
        
        const token = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
        
        const queryRequest = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID
        };
        
        // PRODUCTION URL
        const url = 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';
        
        const response = await axios.post(url, queryRequest, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status query response:', response.data);
        
        const isCompleted = response.data.ResultCode === '0';
        const isPending = response.data.ResultCode === '1037';
        
        res.json({
            success: true,
            status: isCompleted ? 'completed' : (isPending ? 'pending' : 'failed'),
            resultCode: response.data.ResultCode,
            resultDesc: response.data.ResultDesc,
            environment: 'PRODUCTION'
        });
        
    } catch (error) {
        console.error('Status error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status'
        });
    }
});

export default router;
