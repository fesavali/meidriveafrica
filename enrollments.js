import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('enrollments')
            .select('*, courses(*)')
            .eq('user_id', userId);
        
        if (error) throw error;
        
        res.json({ success: true, enrollments: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;