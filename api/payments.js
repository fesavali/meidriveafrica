import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    // GET user payments
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*, courses(id, title)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return res.status(200).json({ success: true, payments: data });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // POST - Create payment record
    if (req.method === 'POST') {
        const { course_id, amount, mpesa_receipt } = req.body;
        
        if (!course_id || !amount) {
            return res.status(400).json({ error: 'Course ID and amount required' });
        }
        
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: user.id,
                course_id: course_id,
                amount: amount,
                mpesa_receipt: mpesa_receipt || null,
                status: mpesa_receipt ? 'completed' : 'pending',
                created_at: new Date()
            }])
            .select();
        
        if (error) return res.status(500).json({ error: error.message });
        
        // If payment completed, create enrollment
        if (mpesa_receipt) {
            await supabase
                .from('enrollments')
                .insert([{
                    user_id: user.id,
                    course_id: course_id,
                    progress: 0,
                    status: 'active',
                    enrolled_at: new Date()
                }]);
        }
        
        return res.status(201).json({ success: true, payment: data[0] });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
