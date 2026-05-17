// src/routeGuard.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jeksrwrzzrczamxijvwl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if user is authenticated
export async function requireAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Check if user is admin
export async function requireAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login.html';
        return false;
    }
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
    
    if (profile?.role !== 'admin') {
        window.location.href = '/dashboard.html';
        return false;
    }
    
    return true;
}

// Redirect if already logged in
export async function redirectIfLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        if (profile?.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/dashboard.html';
        }
        return true;
    }
    
    return false;
}

// Get current user
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    return {
        id: session.user.id,
        email: session.user.email,
        ...profile
    };
}
