// public/supabase.js - Single Source of Truth for MEI DRIVE AFRICA
// This file handles all Supabase operations, Auth, and API calls

const SUPABASE_URL = 'https://qpqkmmkrzxlhcpccefjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s';
const API_BASE_URL = 'https://mei-drive-api.onrender.com';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName || email.split('@')[0] } }
        });
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    } catch (error) {
        return null;
    }
}

async function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// COURSE FUNCTIONS
// ============================================

async function getAllCourses() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

async function getCourseById(courseId) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
}

async function getLessonsByCourseId(courseId) {
    try {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return [];
    }
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

async function getAllQuizQuestions() {
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        return [];
    }
}

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

async function getUserEnrollments(userId) {
    try {
        const { data, error } = await supabase
            .from('user_enrollments')
            .select('course_id, payment_status, amount_paid, paid_at')
            .eq('user_id', userId);
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return [];
    }
}

async function createEnrollment(userId, courseId, amountPaid) {
    try {
        const { data, error } = await supabase
            .from('user_enrollments')
            .upsert({
                user_id: userId,
                course_id: courseId,
                payment_status: 'completed',
                amount_paid: amountPaid,
                paid_at: new Date().toISOString()
            });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// PROGRESS FUNCTIONS
// ============================================

async function getUserProgress(userId, courseId) {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .select('progress, last_accessed')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || { progress: 0 };
    } catch (error) {
        return { progress: 0 };
    }
}

async function updateProgress(userId, courseId, progress) {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                course_id: courseId,
                progress: progress,
                last_accessed: new Date().toISOString()
            });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// M-PESA PAYMENT FUNCTIONS
// ============================================

async function initiateMpesaPayment(phoneNumber, amount, courseId, userId) {
    try {
        // Format phone number
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        }
        if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        const response = await fetch(`${API_BASE_URL}/api/mpesa/stkpush`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: formattedPhone,
                amount: amount,
                accountReference: `COURSE_${courseId}`,
                transactionDesc: `MEI DRIVE Course Enrollment`,
                userId: userId,
                courseId: courseId
            })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Payment initiation failed');
        
        return { success: true, checkoutRequestID: data.checkoutRequestID };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function checkPaymentStatus(checkoutRequestID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mpesa/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutRequestID })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

async function getAllPayments() {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
}

async function getAllUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// ============================================
// EXPORT SINGLE SOURCE OF TRUTH
// ============================================

window.MEIDrive = {
    // Auth
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    onAuthStateChange,
    
    // Courses
    getAllCourses,
    getCourseById,
    getLessonsByCourseId,
    
    // Quiz
    getAllQuizQuestions,
    
    // Enrollment
    getUserEnrollments,
    createEnrollment,
    
    // Progress
    getUserProgress,
    updateProgress,
    
    // M-Pesa
    initiateMpesaPayment,
    checkPaymentStatus,
    
    // Admin
    getAllPayments,
    getAllUsers,
    
    // Utils
    supabase,
    isReady: () => true
};

console.log('✅ MEI DRIVE API Client Ready - Single Source of Truth');
