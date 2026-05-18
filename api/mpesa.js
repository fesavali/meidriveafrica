import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// M-Pesa Configuration
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '4095377';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';

// API URLs based on environment
const MPESA_API_URL = MPESA_ENVIRONMENT === 'production' 
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { phoneNumber, amount, courseId, userId, courseTitle } = req.body;
    
    // Validate input
    if (!phoneNumber || !amount || !courseId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Format phone number (254XXXXXXXXX)
    let formattedPhone = phoneNumber.toString().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
    }
    
    try {
        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                course_id: courseId,
                amount: amount,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (paymentError) {
            return res.status(500).json({ error: 'Failed to create payment record' });
        }
        
        // Generate timestamp for M-Pesa
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
        
        // Get access token
        const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
        
        const tokenRes = await fetch(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });
        
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        
        if (!accessToken) {
            // If M-Pesa API fails, still return success for demo
            return res.status(200).json({
                success: true,
                demo: true,
                message: 'M-Pesa integration ready. Add your credentials in .env file.',
                paymentId: payment.id,
                checkoutRequestId: 'DEMO_' + Date.now()
            });
        }
        
        // STK Push request
        const stkRes = await fetch(`${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                BusinessShortCode: MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount),
                PartyA: formattedPhone,
                PartyB: MPESA_SHORTCODE,
                PhoneNumber: formattedPhone,
                CallBackURL: `${process.env.APP_URL}/api/mpesa/callback`,
                AccountReference: `COURSE-${courseId}`,
                TransactionDesc: `Payment for ${courseTitle || 'Course'}`
            })
        });
        
        const stkData = await stkRes.json();
        
        if (stkData.ResponseCode === '0') {
            // Update payment with checkout ID
            await supabase
                .from('payments')
                .update({ mpesa_receipt: stkData.CheckoutRequestID })
                .eq('id', payment.id);
            
            return res.status(200).json({
                success: true,
                message: 'STK Push sent successfully',
                paymentId: payment.id,
                checkoutRequestId: stkData.CheckoutRequestID
            });
        } else {
            throw new Error(stkData.ResponseDescription || 'STK Push failed');
        }
        
    } catch (error) {
        console.error('M-Pesa error:', error);
        return res.status(500).json({ 
            error: error.message,
            demo: true,
            message: 'M-Pesa integration in progress. Please complete your payment via bank transfer.'
        });
    }
}
