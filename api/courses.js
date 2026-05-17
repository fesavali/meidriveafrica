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
    
    const { id } = req.query;
    
    // GET all courses or single course
    if (req.method === 'GET') {
        try {
            if (id) {
                // Get single course
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return res.status(200).json({ success: true, course: data });
            } else {
                // Get all courses
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .order('id', { ascending: true });
                
                if (error) throw error;
                return res.status(200).json({ success: true, courses: data });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // POST - Create new course (admin only)
    if (req.method === 'POST') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { title, description, content, type, price, duration, level } = req.body;
        
        const { data, error } = await supabase
            .from('courses')
            .insert([{ title, description, content, type, price, duration, level }])
            .select();
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ success: true, course: data[0] });
    }
    
    // PUT - Update course (admin only)
    if (req.method === 'PUT') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        if (!id) return res.status(400).json({ error: 'Course ID required' });
        
        const { title, description, content, type, price, duration, level } = req.body;
        
        const { data, error } = await supabase
            .from('courses')
            .update({ title, description, content, type, price, duration, level, updated_at: new Date() })
            .eq('id', id)
            .select();
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, course: data[0] });
    }
    
    // DELETE - Remove course (admin only)
    if (req.method === 'DELETE') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        if (!id) return res.status(400).json({ error: 'Course ID required' });
        
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);
        
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
