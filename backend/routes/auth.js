// routes/auth.js
// REAL PRODUCTION - MEI DRIVE AFRICA

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase directly (no external config file)
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s'
);

// Helper: Verify user from token
async function verifyUser(token) {
    if (!token) return null;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// Middleware to authenticate user
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const user = await verifyUser(token);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        
        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

// =====================================================
// REGISTER NEW USER
// =====================================================
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }
        
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name || '',
                    phone: phone || ''
                }
            }
        });
        
        if (authError) {
            if (authError.message.includes('already registered')) {
                return res.status(400).json({
                    success: false,
                    error: 'User already registered. Please login.'
                });
            }
            throw authError;
        }
        
        if (!authData.user) {
            return res.status(400).json({
                success: false,
                error: 'Registration failed. Please try again.'
            });
        }
        
        // Create user profile in profiles table
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                full_name: full_name || '',
                phone: phone || '',
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail registration if profile creation fails
        }
        
        res.json({
            success: true,
            message: 'Registration successful! Please check your email to confirm your account.',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: full_name || ''
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});

// =====================================================
// LOGIN USER
// =====================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            throw error;
        }
        
        if (!data.session) {
            return res.status(401).json({
                success: false,
                error: 'Login failed. Please try again.'
            });
        }
        
        // Get user profile
        let profile = null;
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
        
        profile = profileData;
        
        res.json({
            success: true,
            message: 'Login successful',
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            },
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
                phone: profile?.phone || '',
                created_at: profile?.created_at || data.user.created_at
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
});

// =====================================================
// LOGOUT USER
// =====================================================
router.post('/logout', authenticateUser, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Logout failed'
        });
    }
});

// =====================================================
// GET CURRENT USER (ME)
// =====================================================
router.get('/me', authenticateUser, async (req, res) => {
    try {
        // Get user profile
        let profile = null;
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', req.userId)
            .maybeSingle();
        
        profile = profileData;
        
        // Get user enrollments count
        const { count: enrollmentsCount, error: enrollError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.userId);
        
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                full_name: profile?.full_name || req.user.user_metadata?.full_name || '',
                phone: profile?.phone || '',
                role: profile?.role || 'user',
                created_at: profile?.created_at || req.user.created_at,
                enrollments_count: enrollmentsCount || 0
            }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user information'
        });
    }
});

// =====================================================
// FORGOT PASSWORD
// =====================================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://www.meidriveafrica.com/reset-password'
        });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send reset email'
        });
    }
});

// =====================================================
// RESET PASSWORD
// =====================================================
router.post('/reset-password', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }
        
        const { error } = await supabase.auth.updateUser({
            password: password
        });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to reset password'
        });
    }
});

// =====================================================
// REFRESH SESSION
// =====================================================
router.post('/refresh-session', async (req, res) => {
    try {
        const { refresh_token } = req.body;
        
        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });
        
        if (error) throw error;
        
        res.json({
            success: true,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            }
        });
        
    } catch (error) {
        console.error('Refresh session error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Failed to refresh session'
        });
    }
});

// =====================================================
// VERIFY TOKEN
// =====================================================
router.get('/verify-token', authenticateUser, async (req, res) => {
    res.json({
        success: true,
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

export default router;
