// middleware/auth.js
// REAL PRODUCTION - MEI DRIVE AFRICA

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly (no external config file)
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s'
);

// =====================================================
// VERIFY TOKEN HELPER FUNCTION
// =====================================================
export async function verifyToken(token) {
    if (!token) return null;
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        console.error('Token verification error:', error.message);
        return null;
    }
}

// =====================================================
// AUTHENTICATE USER - REQUIRES VALID TOKEN
// =====================================================
export async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'No token provided. Please login to continue.'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Invalid token format.'
            });
        }
        
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            let errorMessage = 'Invalid or expired token';
            if (error?.message?.includes('JWT expired')) {
                errorMessage = 'Session expired. Please login again.';
            } else if (error?.message?.includes('invalid claims')) {
                errorMessage = 'Invalid token. Please login again.';
            }
            
            return res.status(401).json({
                success: false,
                error: 'Authentication failed',
                message: errorMessage,
                code: error?.status || 401
            });
        }
        
        // Attach user to request object
        req.user = user;
        req.userId = user.id;
        req.token = token;
        
        // Get user profile for additional info (optional, don't fail if missing)
        try {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role, full_name, phone')
                .eq('id', user.id)
                .maybeSingle();
            
            req.userProfile = profile;
            req.userRole = profile?.role || 'user';
        } catch (profileError) {
            // Profile fetch failed but auth is still valid
            req.userProfile = null;
            req.userRole = 'user';
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An internal error occurred. Please try again later.'
        });
    }
}

// =====================================================
// OPTIONAL AUTH - DOESN'T FAIL IF NO TOKEN
// =====================================================
export async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            if (token) {
                const { data: { user }, error } = await supabase.auth.getUser(token);
                
                if (!error && user) {
                    req.user = user;
                    req.userId = user.id;
                    
                    // Optionally fetch profile
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('role, full_name')
                        .eq('id', user.id)
                        .maybeSingle();
                    
                    req.userProfile = profile;
                    req.userRole = profile?.role || 'user';
                }
            }
        }
        
        next();
    } catch (error) {
        // Don't fail on optional auth errors
        next();
    }
}

// =====================================================
// ADMIN AUTHENTICATION - REQUIRES ADMIN ROLE
// =====================================================
export async function requireAdmin(req, res, next) {
    try {
        // First authenticate the user
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Admin access requires login.'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Invalid token format.'
            });
        }
        
        // Verify token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed',
                message: 'Invalid or expired token.'
            });
        }
        
        // Check admin role from user_profiles
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('id', user.id)
            .maybeSingle();
        
        const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'Admin privileges required to access this resource.'
            });
        }
        
        req.user = user;
        req.userId = user.id;
        req.userRole = profile?.role;
        req.isAdmin = true;
        
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An internal error occurred.'
        });
    }
}

// =====================================================
// REFRESH TOKEN - GET NEW ACCESS TOKEN
// =====================================================
export async function refreshToken(refreshToken) {
    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });
        
        if (error) throw error;
        
        return {
            success: true,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
        };
    } catch (error) {
        console.error('Token refresh error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// =====================================================
// GET USER FROM TOKEN (Utility function)
// =====================================================
export async function getUserFromToken(token) {
    if (!token) return null;
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
}

// =====================================================
// CHECK IF USER IS ENROLLED IN COURSE
// =====================================================
export async function isUserEnrolled(userId, courseId) {
    if (!userId || !courseId) return false;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('payment_status', 'completed')
            .maybeSingle();
        
        if (error) return false;
        return !!data;
    } catch (error) {
        return false;
    }
}

// =====================================================
// EXPORTS
// =====================================================
export default {
    authenticateUser,
    optionalAuth,
    requireAdmin,
    verifyToken,
    refreshToken,
    getUserFromToken,
    isUserEnrolled
};
