// middleware/admin.js
// REAL PRODUCTION - MEI DRIVE AFRICA
// Complete admin middleware for role-based access control

import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE INITIALIZATION
// =====================================================
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s'
);

// =====================================================
// ADMIN CACHE (5 minutes TTL)
// =====================================================
const adminCache = new Map();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// =====================================================
// HELPER: Get user profile with caching
// =====================================================
async function getUserProfile(userId) {
    if (!userId) return null;
    
    // Check cache first
    const cached = adminCache.get(`profile_${userId}`);
    if (cached && (Date.now() - cached.timestamp) < ADMIN_CACHE_TTL) {
        return cached.data;
    }
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role, is_admin, full_name, email, phone, avatar_url, created_at')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) throw error;
        
        // Cache the result
        if (data) {
            adminCache.set(`profile_${userId}`, {
                data: data,
                timestamp: Date.now()
            });
        }
        
        return data;
    } catch (error) {
        console.error('Get user profile error:', error.message);
        return null;
    }
}

// =====================================================
// HELPER: Clear admin cache
// =====================================================
export function clearAdminCache(userId) {
    if (userId) {
        adminCache.delete(`profile_${userId}`);
        adminCache.delete(`admin_${userId}`);
    } else {
        adminCache.clear();
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
                message: 'Please login to access this resource',
                code: 'AUTH_REQUIRED'
            });
        }
        
        const userId = req.userId || req.user?.id;
        
        // Check cache for admin status
        const cachedAdmin = adminCache.get(`admin_${userId}`);
        if (cachedAdmin && (Date.now() - cachedAdmin.timestamp) < ADMIN_CACHE_TTL) {
            if (!cachedAdmin.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'Admin privileges required to access this resource.',
                    code: 'ADMIN_REQUIRED'
                });
            }
            req.isAdmin = true;
            req.userRole = 'admin';
            return next();
        }
        
        // Get user profile to check role
        const profile = await getUserProfile(userId);
        
        if (!profile) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'User profile not found. Admin privileges required.',
                code: 'PROFILE_NOT_FOUND'
            });
        }
        
        // Check if user has admin role (either role='admin' or is_admin=true)
        const isAdmin = profile.role === 'admin' || profile.is_admin === true;
        
        // Cache the result
        adminCache.set(`admin_${userId}`, {
            isAdmin: isAdmin,
            timestamp: Date.now()
        });
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'Admin privileges required to access this resource.',
                current_role: profile.role || 'user',
                code: 'ADMIN_REQUIRED'
            });
        }
        
        // Attach admin info to request
        req.userRole = profile.role || 'admin';
        req.isAdmin = true;
        req.adminProfile = profile;
        
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authorization failed',
            message: 'An internal error occurred while verifying admin privileges.',
            code: 'INTERNAL_ERROR'
        });
    }
}

// =====================================================
// REQUIRE SUPER ADMIN - Highest level admin access
// =====================================================
export async function requireSuperAdmin(req, res, next) {
    try {
        // First check if user is admin
        if (!req.userId && !req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Please login to access this resource',
                code: 'AUTH_REQUIRED'
            });
        }
        
        const userId = req.userId || req.user?.id;
        const profile = await getUserProfile(userId);
        
        if (!profile) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'User profile not found.',
                code: 'PROFILE_NOT_FOUND'
            });
        }
        
        // Check for super admin (role must be exactly 'admin' AND is_admin true)
        const isSuperAdmin = profile.role === 'admin' && profile.is_admin === true;
        
        if (!isSuperAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'Super admin privileges required.',
                current_role: profile.role || 'user',
                code: 'SUPER_ADMIN_REQUIRED'
            });
        }
        
        req.isSuperAdmin = true;
        req.userRole = 'super_admin';
        req.adminProfile = profile;
        
        next();
    } catch (error) {
        console.error('Super admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authorization failed',
            message: error.message,
            code: 'INTERNAL_ERROR'
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
                    message: 'Please login to access this resource',
                    code: 'AUTH_REQUIRED'
                });
            }
            
            const userId = req.userId || req.user?.id;
            
            // Get user profile
            const profile = await getUserProfile(userId);
            
            if (!profile) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'User profile not found.',
                    code: 'PROFILE_NOT_FOUND'
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
                    current_role: userRole,
                    required_roles: allowedRoles,
                    code: 'ROLE_REQUIRED'
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
                message: error.message,
                code: 'INTERNAL_ERROR'
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
                    message: 'Please login to access this resource',
                    code: 'AUTH_REQUIRED'
                });
            }
            
            const userId = req.userId || req.user?.id;
            
            // Get the resource owner's user ID
            let resourceUserId;
            if (typeof getResourceUserId === 'function') {
                resourceUserId = await getResourceUserId(req);
            } else if (req.params.userId) {
                resourceUserId = req.params.userId;
            } else if (req.body.userId) {
                resourceUserId = req.body.userId;
            } else if (req.query.userId) {
                resourceUserId = req.query.userId;
            } else {
                resourceUserId = userId; // Default to current user if no specific ID
            }
            
            // Get user profile to check admin status
            const profile = await getUserProfile(userId);
            const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
            
            // Allow access if user is the resource owner OR is admin
            if (userId === resourceUserId || isAdmin) {
                req.isOwner = userId === resourceUserId;
                req.isAdmin = isAdmin;
                req.targetUserId = resourceUserId;
                next();
            } else {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'You can only access your own resources.',
                    code: 'OWNER_REQUIRED'
                });
            }
        } catch (error) {
            console.error('Owner/Admin middleware error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authorization failed',
                message: error.message,
                code: 'INTERNAL_ERROR'
            });
        }
    };
}

// =====================================================
// CHECK PERMISSION - Generic permission checker
// =====================================================
const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'instructor': 3,
    'admin': 4,
    'super_admin': 5
};

export async function checkPermission(userId, requiredRole) {
    if (!userId) return false;
    
    try {
        // Check cache
        const cached = adminCache.get(`perm_${userId}_${requiredRole}`);
        if (cached && (Date.now() - cached.timestamp) < ADMIN_CACHE_TTL) {
            return cached.hasPermission;
        }
        
        const profile = await getUserProfile(userId);
        if (!profile) return false;
        
        const userRole = profile.role || 'user';
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        const hasPermission = userLevel >= requiredLevel;
        
        // Cache result
        adminCache.set(`perm_${userId}_${requiredRole}`, {
            hasPermission: hasPermission,
            timestamp: Date.now()
        });
        
        return hasPermission;
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

// =====================================================
// MAKE USER ADMIN (Utility function - for setup only)
// =====================================================
export async function makeUserAdmin(userId, role = 'admin') {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                role: role,
                is_admin: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Clear cache for this user
        clearAdminCache(userId);
        
        return { success: true, profile: data };
    } catch (error) {
        console.error('Make admin error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// REMOVE ADMIN PRIVILEGES
// =====================================================
export async function removeAdminPrivileges(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                role: 'user',
                is_admin: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Clear cache for this user
        clearAdminCache(userId);
        
        return { success: true, profile: data };
    } catch (error) {
        console.error('Remove admin error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// GET ALL ADMIN USERS
// =====================================================
export async function getAllAdminUsers() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id, full_name, email, role, is_admin, created_at')
            .eq('is_admin', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, admins: data || [] };
    } catch (error) {
        console.error('Get admins error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// CHECK IF USER IS ADMIN (Simple utility)
// =====================================================
export async function isAdminUser(userId) {
    if (!userId) return false;
    
    try {
        const profile = await getUserProfile(userId);
        return profile?.role === 'admin' || profile?.is_admin === true;
    } catch (error) {
        return false;
    }
}

// =====================================================
// EXPORTS
// =====================================================
export default {
    requireAdmin,
    requireSuperAdmin,
    requireRole,
    requireOwnerOrAdmin,
    checkPermission,
    makeUserAdmin,
    removeAdminPrivileges,
    getAllAdminUsers,
    isAdminUser,
    getUserProfile,
    clearAdminCache
};
