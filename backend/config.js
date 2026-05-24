require('dotenv').config();

module.exports = {
    // Sandbox Credentials - Automat EA
    consumerKey: '9b0oJej33MSHlgiSmNAxRlrCfceBAQOze',
    consumerSecret: 'hXZJU1IPDrbCjRZJ',
    
    // Paybill
    shortCode: '4095377',
    
    // Default Sandbox Passkey
    passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    
    // Callback URLs (use ngrok for local testing)
    callbackUrl: process.env.CALLBACK_URL || 'https://your-domain.com/api/callback',
    timeoutUrl: process.env.TIMEOUT_URL || 'https://your-domain.com/api/timeout',
    
    // Environment
    environment: process.env.NODE_ENV || 'sandbox',
    
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
