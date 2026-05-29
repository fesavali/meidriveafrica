// config/database.js
// REAL PRODUCTION - MEI DRIVE AFRICA
// Supabase Database Configuration

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// =====================================================
// SUPABASE CONFIGURATION
// =====================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUyNTQ3MiwiZXhwIjoyMDk1MTAxNDcyfQ.8xHkQ3W5jZR2gZmDvVXq7jKyB5tQnC2ySmY9aBcfVpA';

// =====================================================
// PUBLIC CLIENT (For regular operations - frontend compatible)
// =====================================================
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        },
        global: {
            headers: {
                'X-Client-Info': 'mei-drive-africa'
            }
        }
    }
);

// =====================================================
// SERVICE ROLE CLIENT (For admin operations - FULL ACCESS)
// ⚠️ USE WITH CAUTION - This bypasses Row Level Security
// =====================================================
export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            headers: {
                'X-Client-Info': 'mei-drive-africa-admin'
            }
        }
    }
);

// =====================================================
// HELPER: CHECK IF USER IS ADMIN
// =====================================================
export async function isAdmin(userId) {
    if (!userId) return false;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return false;
        return data?.role === 'admin' || data?.is_admin === true;
    } catch (error) {
        console.error('isAdmin error:', error.message);
        return false;
    }
}

// =====================================================
// HELPER: CHECK IF USER IS INSTRUCTOR
// =====================================================
export async function isInstructor(userId) {
    if (!userId) return false;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return false;
        return data?.role === 'instructor';
    } catch (error) {
        console.error('isInstructor error:', error.message);
        return false;
    }
}

// =====================================================
// HELPER: GET USER PROFILE
// =====================================================
export async function getUserProfile(userId) {
    if (!userId) return null;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return null;
        return data;
    } catch (error) {
        console.error('getUserProfile error:', error.message);
        return null;
    }
}

// =====================================================
// HELPER: GET USER PROFILE WITH SERVICE ROLE
// =====================================================
export async function getUserProfileAdmin(userId) {
    if (!userId) return null;
    
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        
        if (error) return null;
        return data;
    } catch (error) {
        console.error('getUserProfileAdmin error:', error.message);
        return null;
    }
}

// =====================================================
// HELPER: CREATE OR UPDATE USER PROFILE
// =====================================================
export async function upsertUserProfile(userId, userData) {
    if (!userId) throw new Error('User ID is required');
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: userId,
                ...userData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('upsertUserProfile error:', error.message);
        throw error;
    }
}

// =====================================================
// HELPER: GET USER ENROLLMENTS
// =====================================================
export async function getUserEnrollments(userId) {
    if (!userId) return [];
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                courses:course_id (
                    id,
                    name,
                    price,
                    icon,
                    duration,
                    units
                )
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });
        
        if (error) return [];
        return data || [];
    } catch (error) {
        console.error('getUserEnrollments error:', error.message);
        return [];
    }
}

// =====================================================
// HELPER: GET COURSE DETAILS
// =====================================================
export async function getCourseDetails(courseId) {
    if (!courseId) return null;
    
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .maybeSingle();
        
        if (error) return null;
        return data;
    } catch (error) {
        console.error('getCourseDetails error:', error.message);
        return null;
    }
}

// =====================================================
// HELPER: GET ALL COURSES (PUBLIC)
// =====================================================
export async function getAllCourses() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) return [];
        return data || [];
    } catch (error) {
        console.error('getAllCourses error:', error.message);
        return [];
    }
}

// =====================================================
// HELPER: CHECK USER ENROLLMENT STATUS
// =====================================================
export async function isUserEnrolled(userId, courseId) {
    if (!userId || !courseId) return false;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('id, payment_status')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (error) return false;
        return data?.payment_status === 'completed';
    } catch (error) {
        console.error('isUserEnrolled error:', error.message);
        return false;
    }
}

// =====================================================
// HELPER: GET COURSE STATISTICS
// =====================================================
export async function getCourseStatistics(courseId) {
    try {
        const { count: totalEnrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId)
            .eq('payment_status', 'completed');
        
        const { count: totalRevenue, error: revenueError } = await supabase
            .from('transactions')
            .select('amount', { count: 'exact', head: true })
            .eq('course_id', courseId)
            .eq('status', 'completed');
        
        return {
            total_enrollments: totalEnrollments || 0,
            total_revenue: totalRevenue || 0,
            error: enrollError || revenueError
        };
    } catch (error) {
        console.error('getCourseStatistics error:', error.message);
        return { total_enrollments: 0, total_revenue: 0 };
    }
}

// =====================================================
// HELPER: GET DASHBOARD STATS (ADMIN)
// =====================================================
export async function getDashboardStats() {
    try {
        const [
            { count: totalUsers },
            { count: totalCourses },
            { count: totalEnrollments },
            { count: completedEnrollments }
        ] = await Promise.all([
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            supabase.from('courses').select('*', { count: 'exact', head: true }),
            supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('payment_status', 'completed'),
            supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'completed')
        ]);
        
        // Get total revenue
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('status', 'completed');
        
        const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        return {
            total_users: totalUsers || 0,
            total_courses: totalCourses || 0,
            total_enrollments: totalEnrollments || 0,
            completed_enrollments: completedEnrollments || 0,
            total_revenue: totalRevenue
        };
    } catch (error) {
        console.error('getDashboardStats error:', error.message);
        return null;
    }
}

// =====================================================
// EXPORTS
// =====================================================
export default {
    supabase,
    supabaseAdmin,
    isAdmin,
    isInstructor,
    getUserProfile,
    getUserProfileAdmin,
    upsertUserProfile,
    getUserEnrollments,
    getCourseDetails,
    getAllCourses,
    isUserEnrolled,
    getCourseStatistics,
    getDashboardStats
};
