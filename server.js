// server.js - Complete backend with M-Pesa mock endpoint
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve HTML files from current directory

// Store transactions in memory (use database in production)
const transactions = [];
const paymentStatuses = new Map();

// ============================================
// M-PESA API ROUTES
// ============================================

// STK Push endpoint - matches your frontend call
app.post('/api/mpesa/stkpush', (req, res) => {
    console.log('📱 M-Pesa STK Push Request:', req.body);
    
    const { phoneNumber, amount, accountReference, transactionDesc, userId } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !amount) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: phoneNumber and amount are required'
        });
    }
    
    // Generate unique transaction ID
    const checkoutRequestID = 'MOCK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    
    // Store transaction
    const transaction = {
        id: transactions.length + 1,
        userId: userId || 'guest',
        phoneNumber,
        amount,
        accountReference: accountReference || 'COURSE_PAYMENT',
        transactionDesc: transactionDesc || 'Course Enrollment',
        checkoutRequestID,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    transactions.push(transaction);
    paymentStatuses.set(checkoutRequestID, { status: 'pending', resultDesc: 'Payment pending' });
    
    console.log(`💰 Payment initiated: ${amount} KES to ${phoneNumber}`);
    console.log(`📝 Transaction ID: ${checkoutRequestID}`);
    
    // Return success response matching what frontend expects
    res.json({
        success: true,
        message: 'STK Push sent successfully. Check your phone for M-Pesa prompt.',
        checkoutRequestID: checkoutRequestID,
        data: {
            MerchantRequestID: 'MOCK-MERCHANT-' + Date.now(),
            CheckoutRequestID: checkoutRequestID,
            ResponseCode: '0',
            ResponseDescription: 'Success. Request accepted for processing'
        }
    });
    
    // Simulate payment completion after 10 seconds (for demo)
    setTimeout(() => {
        // Randomly succeed or fail for demo (70% success rate)
        const isSuccess = Math.random() < 0.7;
        
        if (isSuccess) {
            paymentStatuses.set(checkoutRequestID, {
                status: 'completed',
                resultCode: 0,
                resultDesc: 'Payment completed successfully',
                mpesaReceiptNumber: 'MOCK' + Date.now().toString().slice(-10)
            });
            console.log(`✅ Payment completed for ${checkoutRequestID}`);
        } else {
            paymentStatuses.set(checkoutRequestID, {
                status: 'failed',
                resultCode: 1037,
                resultDesc: 'User cancelled the transaction'
            });
            console.log(`❌ Payment failed for ${checkoutRequestID}`);
        }
    }, 10000);
});

// Payment status endpoint
app.post('/api/mpesa/status', (req, res) => {
    const { checkoutRequestID } = req.body;
    
    console.log(`🔍 Checking status for: ${checkoutRequestID}`);
    
    const status = paymentStatuses.get(checkoutRequestID);
    
    if (status) {
        res.json({
            success: true,
            status: status.status,
            resultCode: status.resultCode,
            resultDesc: status.resultDesc,
            mpesaReceiptNumber: status.mpesaReceiptNumber
        });
    } else {
        res.json({
            success: false,
            status: 'unknown',
            resultDesc: 'Transaction not found'
        });
    }
});

// Get user transactions
app.get('/api/mpesa/transactions', (req, res) => {
    res.json({
        success: true,
        transactions: transactions
    });
});

// M-Pesa Callback endpoint (for real M-Pesa integration)
app.post('/api/mpesa/callback', (req, res) => {
    console.log('📞 M-Pesa Callback received:', req.body);
    
    // Update transaction status based on callback
    // This is where you'd update your database
    
    res.json({
        ResultCode: 0,
        ResultDesc: 'Success'
    });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        endpoints: {
            stkpush: 'POST /api/mpesa/stkpush',
            status: 'POST /api/mpesa/status',
            transactions: 'GET /api/mpesa/transactions',
            callback: 'POST /api/mpesa/callback'
        }
    });
});

// ============================================
// SERVE YOUR HTML FILE
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     🚀 MEI DRIVE AFRICA BACKEND RUNNING           ║
╠═══════════════════════════════════════════════════╣
║  Port: ${PORT}                                       ║
║  M-Pesa STK Push: http://localhost:${PORT}/api/mpesa/stkpush ║
║  Status Check: http://localhost:${PORT}/api/mpesa/status    ║
║  Health Check: http://localhost:${PORT}/api/health         ║
╚═══════════════════════════════════════════════════╝
    `);
});
