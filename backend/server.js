import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });
    
    if (error) return res.status(400).json({ error: error.message });
    
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'learner'
        });
    }
    
    res.json({ success: true, message: 'Registration successful' });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();
    
    res.json({
        success: true,
        session: data.session,
        user: {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'learner',
            fullName: profile?.full_name
        }
    });
});

// Courses endpoints
app.get('/api/courses', async (req, res) => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, courses: data });
});

// M-Pesa endpoint (same as above)
app.post('/api/mpesa/stkpush', async (req, res) => {
    // ... M-Pesa logic from api/mpesa.js
    res.json({ success: true, mock: true, message: 'M-Pesa initiated' });
});

// Catch all - serve index.html
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});
