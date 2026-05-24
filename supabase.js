// supabase.js - MEI DRIVE AFRICA - SINGLE SOURCE OF TRUTH
// ============================================
// DATABASE CONFIGURATION
// ============================================
const MEI_DRIVE_CONFIG = {
    SUPABASE_URL: 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s',
    APP_NAME: 'MEI DRIVE AFRICA',
    VERSION: '1.0.0'
};

console.log(`🚀 ${MEI_DRIVE_CONFIG.APP_NAME} v${MEI_DRIVE_CONFIG.VERSION} initializing...`);

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
let supabaseClient = null;
let isInitialized = false;

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (isInitialized) return supabaseClient;
    
    // Check if Supabase library is loaded
    if (typeof supabase === 'undefined' && typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Please check your internet connection.');
        return null;
    }
    
    const supabaseLib = window.supabase || supabase;
    
    try {
        supabaseClient = supabaseLib.createClient(
            MEI_DRIVE_CONFIG.SUPABASE_URL, 
            MEI_DRIVE_CONFIG.SUPABASE_ANON_KEY,
            {
                auth: { 
                    autoRefreshToken: true, 
                    persistSession: true, 
                    detectSessionInUrl: true 
                }
            }
        );
        isInitialized = true;
        console.log('✅ Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error.message);
        return null;
    }
}

const supabase = initSupabase();

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

async function meiGetCurrentUser() {
    if (!supabase) return null;
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

async function meiGetSession() {
    if (!supabase) return null;
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) return null;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

async function meiLogin(email, password) {
    if (!supabase) return { success: false, error: 'Supabase not ready' };
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('✅ User logged in:', email);
        return { success: true, error: null };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
}

async function meiRegister(email, password) {
    if (!supabase) return { success: false, error: 'Supabase not ready' };
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user?.identities?.length === 0) {
            return { success: false, error: 'Email already registered' };
        }
        console.log('✅ User registered:', email);
        return { success: true, error: null };
    } catch (error) {
        console.error('Register error:', error.message);
        return { success: false, error: error.message };
    }
}

async function meiLogout() {
    if (!supabase) return;
    try {
        await supabase.auth.signOut();
        console.log('✅ User logged out');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ============================================
// COURSE FUNCTIONS
// ============================================

async function meiGetAllCourses() {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        console.log(`📚 Loaded ${data?.length || 0} courses`);
        return data || [];
    } catch (error) {
        console.error('Fetch courses error:', error);
        return [];
    }
}

async function meiGetCourseById(courseId) {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Fetch course by ID error:', error);
        return null;
    }
}

async function meiGetCourseByTitle(title) {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('title', title)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Fetch course by title error:', error);
        return null;
    }
}

// ============================================
// UNITS/LESSONS FUNCTIONS
// ============================================

async function meiGetCourseUnits(courseId) {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .eq('course_id', courseId)
            .eq('is_published', true)
            .order('unit_number', { ascending: true });
        
        if (error) throw error;
        console.log(`📖 Loaded ${data?.length || 0} units for course ${courseId}`);
        return data || [];
    } catch (error) {
        console.error('Fetch units error:', error);
        return [];
    }
}

// Alias for compatibility
async function meiGetLessons(courseId) {
    return meiGetCourseUnits(courseId);
}

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

async function meiGetUserEnrollments(userId) {
    if (!supabase || !userId) return [];
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Fetch enrollments error:', error);
        return [];
    }
}

async function meiCheckEnrollment(userId, courseId) {
    if (!supabase || !userId || !courseId) return false;
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (error) throw error;
        return !!data;
    } catch (error) {
        console.error('Check enrollment error:', error);
        return false;
    }
}

async function meiEnrollInCourse(userId, courseId) {
    if (!supabase) return { success: false, error: 'Supabase not ready' };
    
    try {
        // Check if already enrolled
        const isEnrolled = await meiCheckEnrollment(userId, courseId);
        if (isEnrolled) {
            return { success: false, error: 'Already enrolled in this course' };
        }
        
        const { error } = await supabase
            .from('enrollments')
            .insert([{ 
                user_id: userId, 
                course_id: Number(courseId), 
                progress: 0, 
                status: 'active',
                enrolled_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        console.log(`✅ User ${userId} enrolled in course ${courseId}`);
        return { success: true, error: null };
    } catch (error) {
        console.error('Enrollment error:', error);
        return { success: false, error: error.message };
    }
}

async function meiUpdateProgress(userId, courseId, progress) {
    if (!supabase) return { success: false, error: 'Supabase not ready' };
    
    try {
        const { error } = await supabase
            .from('enrollments')
            .update({ 
                progress: progress,
                last_accessed: new Date().toISOString(),
                completed_at: progress === 100 ? new Date().toISOString() : null,
                status: progress === 100 ? 'completed' : 'active'
            })
            .eq('user_id', userId)
            .eq('course_id', courseId);
        
        if (error) throw error;
        return { success: true, error: null };
    } catch (error) {
        console.error('Update progress error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

async function meiGetQuizCount() {
    if (!supabase) return 0;
    try {
        const { count, error } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Get quiz count error:', error);
        return 500;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function meiIsReady() {
    return supabase !== null && isInitialized;
}

function meiGetConfig() {
    return { ...MEI_DRIVE_CONFIG };
}

// ============================================
// EXPORT GLOBALLY
// ============================================
window.MEIDrive = {
    // Config
    config: MEI_DRIVE_CONFIG,
    isReady: meiIsReady,
    getConfig: meiGetConfig,
    
    // Auth
    getCurrentUser: meiGetCurrentUser,
    getSession: meiGetSession,
    login: meiLogin,
    register: meiRegister,
    logout: meiLogout,
    
    // Courses
    getAllCourses: meiGetAllCourses,
    getCourseById: meiGetCourseById,
    getCourseByTitle: meiGetCourseByTitle,
    
    // Units/Lessons
    getCourseUnits: meiGetCourseUnits,
    getLessons: meiGetLessons,  // Alias
    
    // Enrollments
    getUserEnrollments: meiGetUserEnrollments,
    checkEnrollment: meiCheckEnrollment,
    enrollInCourse: meiEnrollInCourse,
    updateProgress: meiUpdateProgress,
    
    // Quiz
    getQuizCount: meiGetQuizCount,
    
    // Direct access (for advanced use)
    supabase: supabase
};

// Legacy aliases for compatibility with existing code
window.MEIDrive.fetchCourses = window.MEIDrive.getAllCourses;
window.MEIDrive.fetchCourseById = window.MEIDrive.getCourseById;
window.MEIDrive.fetchLessons = window.MEIDrive.getLessons;
window.MEIDrive.fetchEnrollments = window.MEIDrive.getUserEnrollments;
window.MEIDrive.loginUser = window.MEIDrive.login;
window.MEIDrive.registerUser = window.MEIDrive.register;
window.MEIDrive.logoutUser = window.MEIDrive.logout;

// ============================================
// INITIALIZATION LOG
// ============================================
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🚗 MEI DRIVE AFRICA - Driver Training Platform       ║
║                                                           ║
║     Version: ${MEI_DRIVE_CONFIG.VERSION}                                       ║
║     Status: ${meiIsReady() ? '✅ READY' : '❌ ERROR'}                                    ║
║     Supabase: ${supabase ? '✅ Connected' : '❌ Failed'}                                 ║
║                                                           ║
║     Available Methods:                                    ║
║     • MEIDrive.login(email, password)                     ║
║     • MEIDrive.register(email, password)                  ║
║     • MEIDrive.getAllCourses()                            ║
║     • MEIDrive.getCourseUnits(courseId)                   ║
║     • MEIDrive.enrollInCourse(userId, courseId)           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Auto-test connection
if (meiIsReady()) {
    console.log('🎉 MEI DRIVE AFRICA is ready to use!');
} else {
    console.error('⚠️ MEI DRIVE AFRICA initialization failed. Please refresh the page.');
}
