// middleware/auth.js
// REAL PRODUCTION - MEI DRIVE AFRICA
// Complete authentication middleware for all endpoints

import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE INITIALIZATION
// =====================================================
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s'
);

// =====================================================
// CACHE FOR ADMIN STATUS (5 minutes)
// =====================================================
const adminCache = new Map();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
// GET USER PROFILE WITH CACHING
// =====================================================
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('full_name, phone, is_admin, role, avatar_url')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return null;
        return data;
    } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
    }
}

// =====================================================
// CHECK IF USER IS ADMIN (with caching)
// =====================================================
async function isAdminUser(userId) {
    // Check cache first
    const cached = adminCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < ADMIN_CACHE_TTL) {
        return cached.isAdmin;
    }
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('is_admin, role')
            .eq('id', userId)
            .maybeSingle();
        
        const isAdmin = data?.is_admin === true || data?.role === 'admin';
        
        // Store in cache
        adminCache.set(userId, {
            isAdmin: isAdmin,
            timestamp: Date.now()
        });
        
        return isAdmin;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
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
                message: 'No token provided. Please login to continue.',
                code: 'NO_TOKEN'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Invalid token format.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            let errorMessage = 'Invalid or expired token';
            let errorCode = 'INVALID_TOKEN';
            
            if (error?.message?.includes('JWT expired')) {
                errorMessage = 'Session expired. Please login again.';
                errorCode = 'TOKEN_EXPIRED';
            } else if (error?.message?.includes('invalid claims')) {
                errorMessage = 'Invalid token. Please login again.';
                errorCode = 'INVALID_CLAIMS';
            }
            
            return res.status(401).json({
                success: false,
                error: 'Authentication failed',
                message: errorMessage,
                code: errorCode
            });
        }
        
        // Attach user to request object
        req.user = user;
        req.userId = user.id;
        req.token = token;
        
        // Get user profile (non-blocking, don't fail if missing)
        const profile = await getUserProfile(user.id);
        req.userProfile = profile;
        req.userRole = profile?.role || 'user';
        req.isAdmin = profile?.is_admin === true || profile?.role === 'admin';
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An internal error occurred. Please try again later.',
            code: 'INTERNAL_ERROR'
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
                    req.token = token;
                    
                    // Optionally fetch profile
                    const profile = await getUserProfile(user.id);
                    req.userProfile = profile;
                    req.userRole = profile?.role || 'user';
                    req.isAdmin = profile?.is_admin === true || profile?.role === 'admin';
                }
            }
        }
        
        next();
    } catch (error) {
        // Don't fail on optional auth errors
        console.error('Optional auth error:', error.message);
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
                message: 'Admin access requires login.',
                code: 'NO_TOKEN'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Invalid token format.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        
        // Verify token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            let errorMessage = 'Invalid or expired token';
            if (error?.message?.includes('JWT expired')) {
                errorMessage = 'Session expired. Please login again.';
            }
            
            return res.status(401).json({
                success: false,
                error: 'Authentication failed',
                message: errorMessage,
                code: 'AUTH_FAILED'
            });
        }
        
        // Check admin role
        const isAdmin = await isAdminUser(user.id);
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'Admin privileges required to access this resource.',
                code: 'ADMIN_REQUIRED'
            });
        }
        
        req.user = user;
        req.userId = user.id;
        req.token = token;
        req.isAdmin = true;
        
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An internal error occurred.',
            code: 'INTERNAL_ERROR'
        });
    }
}

// =====================================================
// REFRESH TOKEN - GET NEW ACCESS TOKEN
// =====================================================
export async function refreshToken(refreshToken) {
    if (!refreshToken) {
        return {
            success: false,
            error: 'Refresh token required',
            code: 'NO_REFRESH_TOKEN'
        };
    }
    
    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });
        
        if (error) throw error;
        
        if (!data.session) {
            throw new Error('No session returned');
        }
        
        return {
            success: true,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: data.user
        };
    } catch (error) {
        console.error('Token refresh error:', error);
        return {
            success: false,
            error: error.message || 'Token refresh failed',
            code: 'REFRESH_FAILED'
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
        
        const profile = await getUserProfile(user.id);
        
        return {
            ...user,
            profile
        };
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
            .select('id, payment_status')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('status', 'active')
            .maybeSingle();
        
        if (error) return false;
        
        // Check if payment is completed
        const isPaid = data?.payment_status === 'completed';
        return !!data && isPaid;
    } catch (error) {
        console.error('Enrollment check error:', error);
        return false;
    }
}

// =====================================================
// GET USER ENROLLMENTS (Utility)
// =====================================================
export async function getUserEnrollments(userId) {
    if (!userId) return [];
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                id,
                course_id,
                payment_status,
                enrolled_at,
                courses:course_id (
                    id,
                    name,
                    price,
                    duration,
                    icon
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('enrolled_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Get enrollments error:', error);
        return [];
    }
}

// =====================================================
// CLEAR ADMIN CACHE (Utility)
// =====================================================
export function clearAdminCache(userId) {
    if (userId) {
        adminCache.delete(userId);
    } else {
        adminCache.clear();
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
    isUserEnrolled,
    getUserEnrollments,
    clearAdminCache
};
