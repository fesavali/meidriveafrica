// In your API route handler
import { initiatePayment } from './services/mpesaService.js';

app.post('/api/payments/mpesa/initiate', async (req, res) => {
    try {
        const { phoneNumber, amount, courseId, userId, email, courseName } = req.body;
        
        const result = await initiatePayment(
            userId, 
            courseId, 
            courseName, 
            amount, 
            phoneNumber
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
