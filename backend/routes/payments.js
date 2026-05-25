// routes/payments.js
import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { validatePayment } from '../middleware/validation.js';
import { initiatePayment, checkPaymentStatus, processCallback } from '../services/mpesaService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Initiate M-Pesa payment
router.post('/mpesa/initiate', authenticateUser, validatePayment, async (req, res) => {
    try {
        const { phoneNumber, amount, course_id } = req.body;
        const userId = req.userId;
        
        // Get course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('title, price')
            .eq('id', course_id)
            .single();
        
        if (courseError || !course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }
        
        // Verify amount matches course price
        if (amount !== course.price) {
            return res.status(400).json({
                success: false,
                error: 'Amount does not match course price'
            });
        }
        
        const result = await initiatePayment(userId, course_id, course.title, amount, phoneNumber);
        
        res.json({
            success: true,
            message: 'Payment initiated. Check your phone for M-Pesa prompt.',
            data: result
        });
        
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Payment initiation failed'
        });
    }
});

// Check payment status
router.get('/mpesa/status/:checkoutRequestId', authenticateUser, async (req, res) => {
    try {
        const { checkoutRequestId } = req.params;
        
        const payment = await supabase
            .from('payments')
            .select('*')
            .eq('checkout_request_id', checkoutRequestId)
            .single();
        
        if (payment.error) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        res.json({
            success: true,
            status: payment.data.status,
            receipt: payment.data.mpesa_receipt,
            payment_date: payment.data.payment_date
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// M-Pesa callback (public endpoint - Safaricom calls this)
router.post('/mpesa/callback', async (req, res) => {
    try {
        console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
        
        const result = await processCallback(req.body);
        
        res.json({
            ResultCode: 0,
            ResultDesc: 'Success'
        });
        
    } catch (error) {
        console.error('Callback processing error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
});

// Get user's payment history
router.get('/my-payments', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*, courses(title)')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            payments: data
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
