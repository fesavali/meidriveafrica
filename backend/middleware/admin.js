// middleware/admin.js
// REAL PRODUCTION - MEI DRIVE AFRICA

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly (no external config file)
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s'
);

// Helper: Get user profile
async function getUserProfile(userId) {
    if (!userId) return null;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role, is_admin, full_name, email')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return null;
        return data;
    } catch (error) {
        console.error('Get user profile error:', error.message);
        return null;
    }
}

// =====================================================
// REQUIRE ADMIN - Check if user has admin role
// =====================================================
export async function requireAdmin(req, res, next) {
    try {
        // Check if user is authenticated
        if (!req.userId && !req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }
        
        const userId = req.userId || req.user?.id;
        
        // Get user profile to check role
        const profile = await getUserProfile(userId);
        
        if (!profile) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'User profile not found. Admin privileges required.'
            });
        }
        
        // Check if user has admin role (either role='admin' or is_admin=true)
        const isAdmin = profile.role === 'admin' || profile.is_admin === true;
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'Admin privileges required to access this resource.',
                current_role: profile.role || 'user'
            });
        }
        
        // Attach admin info to request
        req.userRole = profile.role;
        req.isAdmin = true;
        req.adminProfile = profile;
        
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authorization failed',
            message: 'An internal error occurred while verifying admin privileges.'
        });
    }
}

// =====================================================
// REQUIRE SPECIFIC ROLE - Check if user has one of the allowed roles
// =====================================================
export function requireRole(...allowedRoles) {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.userId && !req.user?.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Please login to access this resource'
                });
            }
            
            const userId = req.userId || req.user?.id;
            
            // Get user profile
            const profile = await getUserProfile(userId);
            
            if (!profile) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'User profile not found.'
                });
            }
            
            // Check if user role is in allowed roles
            const userRole = profile.role || 'user';
            const hasRequiredRole = allowedRoles.includes(userRole);
            
            if (!hasRequiredRole) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
                    current_role: userRole
                });
            }
            
            // Attach role info to request
            req.userRole = userRole;
            req.userProfile = profile;
            
            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authorization failed',
                message: error.message
            });
        }
    };
}

// =====================================================
// REQUIRE OWNER OR ADMIN - User can access own resources or admin
// =====================================================
export function requireOwnerOrAdmin(getResourceUserId) {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.userId && !req.user?.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Please login to access this resource'
                });
            }
            
            const userId = req.userId || req.user?.id;
            
            // Get the resource owner's user ID
            let resourceUserId;
            if (typeof getResourceUserId === 'function') {
                resourceUserId = await getResourceUserId(req);
            } else {
                resourceUserId = req.params.userId || req.body.userId;
            }
            
            // Get user profile to check admin status
            const profile = await getUserProfile(userId);
            const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
            
            // Allow access if user is the resource owner OR is admin
            if (userId === resourceUserId || isAdmin) {
                req.isOwner = userId === resourceUserId;
                req.isAdmin = isAdmin;
                next();
            } else {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'You can only access your own resources.'
                });
            }
        } catch (error) {
            console.error('Owner/Admin middleware error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authorization failed',
                message: error.message
            });
        }
    };
}

// =====================================================
// CHECK PERMISSION - Generic permission checker
// =====================================================
export async function checkPermission(userId, requiredRole) {
    if (!userId) return false;
    
    try {
        const profile = await getUserProfile(userId);
        if (!profile) return false;
        
        const userRole = profile.role || 'user';
        const roleHierarchy = {
            'user': 1,
            'moderator': 2,
            'instructor': 3,
            'admin': 4
        };
        
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

// =====================================================
// MAKE USER ADMIN (Utility function - for setup only)
// =====================================================
export async function makeUserAdmin(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                role: 'admin',
                is_admin: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, profile: data };
    } catch (error) {
        console.error('Make admin error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// EXPORTS
// =====================================================
export default {
    requireAdmin,
    requireRole,
    requireOwnerOrAdmin,
    checkPermission,
    makeUserAdmin,
    getUserProfile
};
