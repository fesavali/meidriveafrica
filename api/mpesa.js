import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

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
    
    const { courseId, userId, phoneNumber } = req.body;
    
    // Validate input
    if (!courseId || !userId || !phoneNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate Kenyan phone number
    const phoneRegex = /^(254|0)[7-9][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format. Use 0712345678 or 254712345678' });
    }
    
    try {
        // Get course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('price, title')
            .eq('id', courseId)
            .single();
        
        if (courseError || !course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // Format phone number for M-Pesa
        const formattedPhone = phoneNumber.startsWith('0') 
            ? '254' + phoneNumber.slice(1) 
            : phoneNumber;
        
        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                course_id: courseId,
                amount: course.price,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (paymentError) {
            return res.status(500).json({ error: 'Failed to create payment record' });
        }
        
        // TODO: Integrate with Safaricom M-Pesa API
        // This is where you'd call the actual M-Pesa STK Push
        // For now, simulate payment success
        
        // Simulate payment processing
        setTimeout(async () => {
            await supabase
                .from('payments')
                .update({ 
                    status: 'completed',
                    mpesa_receipt: 'MPESA' + Date.now(),
                    completed_at: new Date().toISOString()
                })
                .eq('id', payment.id);
            
            // Create enrollment after successful payment
            await supabase
                .from('enrollments')
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    progress: 0,
                    status: 'active',
                    enrolled_at: new Date().toISOString()
                });
        }, 2000);
        
        return res.status(200).json({
            success: true,
            message: 'STK Push sent to your phone',
            paymentId: payment.id,
            checkoutRequestId: 'MOCK_' + Date.now()
        });
        
    } catch (error) {
        console.error('M-Pesa error:', error);
        return res.status(500).json({ error: 'Payment processing failed' });
    }
}
