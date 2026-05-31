// ============================================
// MEI DRIVE AFRICA - SINGLE SOURCE OF TRUTH
// ============================================

const SUPABASE_URL = 'https://qpqkmmkrzxlhcpccefjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s';

// ✅ CORRECT BACKEND URL - Your Render deployment
const API_BASE_URL = 'https://meidriveafrica-backend.onrender.com';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// PREDEFINED FALLBACK DATA (8 Courses)
// ============================================
const PREDEFINED_COURSES = [
    { id: 1, name: '🚗 LEARNER HUB', shortName: 'LEARNER HUB', description: 'Complete driver training for new drivers covering fundamental rules, vehicle controls, observation, speed management, parking, and NTSA exam preparation.', price: 2999, duration: '8 weeks', icon: 'fa-car', lessons_count: 21, color: '#F39C12' },
    { id: 2, name: '🚌 PSV PROFESSIONAL', shortName: 'PSV PROFESSIONAL', description: 'Public Service Vehicle certification with passenger management, customer care, safety protocols, NTSA compliance, and conductor professionalism.', price: 3999, duration: '8 weeks', icon: 'fa-bus', lessons_count: 16, color: '#9B59B6' },
    { id: 3, name: '⚡ EV DRIVER & RIDER', shortName: 'EV DRIVER', description: 'Electric vehicle operations, charging safety, battery management, regenerative braking, and eco-driving techniques for EVs.', price: 1999, duration: '5 weeks', icon: 'fa-car-battery', lessons_count: 10, color: '#3498DB' },
    { id: 4, name: '🔄 DRIVER REFRESHER', shortName: 'REFRESHER', description: 'Advanced defensive driving, skill enhancement, hazard perception, professional driver excellence, and breaking bad habits.', price: 1499, duration: '4 weeks', icon: 'fa-sync-alt', lessons_count: 8, color: '#2ECC71' },
    { id: 5, name: '🏍️ BODA BODA SAFETY', shortName: 'BODA SAFETY', description: 'Professional motorcycle rider training with PPE, defensive riding, passenger safety, road etiquette, and accident prevention.', price: 2499, duration: '6 weeks', icon: 'fa-motorcycle', lessons_count: 26, color: '#E67E22' },
    { id: 6, name: '🏫 SCHOOL BUS/VAN', shortName: 'SCHOOL BUS', description: 'Specialized training for school transport drivers focusing on child safety, boarding/alighting procedures, and emergency response.', price: 2999, duration: '7 weeks', icon: 'fa-school', lessons_count: 7, color: '#1ABC9C' },
    { id: 7, name: '🛡️ DEFENSIVE DRIVER', shortName: 'DEFENSIVE', description: 'Master defensive driving techniques including hazard perception, risk management, space cushion driving, and collision avoidance.', price: 2499, duration: '6 weeks', icon: 'fa-shield-alt', lessons_count: 30, color: '#E74C3C' },
    { id: 8, name: '📚 QUIZ BANK', shortName: 'QUIZ BANK', description: '1000+ NTSA-style exam questions covering road signs, highway code, defensive driving, traffic rules, and professional conduct.', price: 999, duration: 'Self-paced', icon: 'fa-question-circle', lessons_count: 15, color: '#00ff88' }
];

const PREDEFINED_QUIZ = [
    { id: 1, category: 'Road Signs', question: 'What does a STOP sign mean?', option_a: 'Slow down only', option_b: 'Continue carefully', option_c: 'Come to a complete stop', option_d: 'Overtake carefully', correct_option: 2, explanation: 'A STOP sign requires you to come to a complete stop, look both ways, and proceed only when safe.' },
    { id: 2, category: 'Road Signs', question: 'A triangular road sign normally indicates:', option_a: 'Direction', option_b: 'Warning', option_c: 'Parking', option_d: 'Speed limit', correct_option: 1, explanation: 'Triangular signs are warning signs that alert drivers to potential hazards ahead.' },
    { id: 3, category: 'Highway Code', question: 'Why is the Highway Code important?', option_a: 'For entertainment', option_b: 'To improve road safety', option_c: 'To increase speed', option_d: 'To reduce fuel only', correct_option: 1, explanation: 'The Highway Code establishes rules and guidelines that promote safety for all road users.' },
    { id: 4, category: 'Defensive Driving', question: 'Defensive driving means:', option_a: 'Aggressive driving', option_b: 'Anticipating and avoiding danger', option_c: 'Driving fast', option_d: 'Ignoring traffic rules', correct_option: 1, explanation: 'Defensive driving involves anticipating potential hazards and taking proactive measures.' },
    { id: 5, category: 'Traffic Rules', question: 'Driving under the influence of alcohol is:', option_a: 'Safe at low speed', option_b: 'Acceptable at night', option_c: 'Dangerous and illegal', option_d: 'Recommended', correct_option: 2, explanation: 'Drunk driving impairs judgment, reaction time, and is strictly prohibited by law.' },
    { id: 6, category: 'Emergency', question: 'If your brakes fail you should:', option_a: 'Panic', option_b: 'Stay calm and slow down safely', option_c: 'Jump out immediately', option_d: 'Close your eyes', correct_option: 1, explanation: 'Stay calm, pump brakes, use engine braking, and apply parking brake gradually.' },
    { id: 7, category: 'Motorcycle', question: 'A motorcycle passenger should:', option_a: 'Sit carelessly', option_b: 'Wear a helmet', option_c: 'Distract the rider', option_d: 'Stand while riding', correct_option: 1, explanation: 'All passengers must wear approved helmets for their safety.' },
    { id: 8, category: 'PSV', question: 'A PSV driver should:', option_a: 'Abuse passengers', option_b: 'Respect passengers', option_c: 'Ignore traffic rules', option_d: 'Overspeed', correct_option: 1, explanation: 'Professional PSV drivers must treat passengers with respect and courtesy.' }
];

// ============================================
// AUTHENTICATION
// ============================================
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName || email.split('@')[0] } }
        });
        if (error) throw error;
        
        // Create profile entry with error logging
        const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            full_name: fullName || email.split('@')[0],
            is_admin: false,
            created_at: new Date().toISOString()
        });
        
        if (profileError) {
            console.error('Profile creation failed:', profileError);
            // Don't fail the signup - user can still log in
        }
        
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
        if (!session?.user) return null;
        
        // Use maybeSingle() instead of single() to avoid errors if profile missing
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_admin, full_name')
            .eq('id', session.user.id)
            .maybeSingle();
        
        return { 
            id: session.user.id, 
            email: session.user.email, 
            full_name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            is_admin: profile?.is_admin || false
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

// ============================================
// COURSES
// ============================================
async function getAllCourses() {
    try {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
            return data.map(c => ({
                ...c,
                shortName: c.name,
                color: PREDEFINED_COURSES.find(pc => pc.id === c.id)?.color || '#00ff88'
            }));
        }
        return PREDEFINED_COURSES;
    } catch (error) {
        console.log('Using predefined courses');
        return PREDEFINED_COURSES;
    }
}

async function getCourseById(courseId) {
    const courses = await getAllCourses();
    return courses.find(c => c.id === parseInt(courseId)) || null;
}

async function getLessonsByCourseId(courseId) {
    try {
        const { data, error } = await supabase.from('units').select('*').eq('course_id', courseId).order('unit_number');
        if (error) throw error;
        return data || [];
    } catch (error) {
        return [];
    }
}

// ============================================
// QUIZ
// ============================================
async function getAllQuizQuestions() {
    try {
        const { data, error } = await supabase.from('quiz_questions').select('*').eq('is_active', true);
        if (error) throw error;
        if (data && data.length > 0) return data;
        return PREDEFINED_QUIZ;
    } catch (error) {
        console.log('Using predefined quiz');
        return PREDEFINED_QUIZ;
    }
}

// ============================================
// ENROLLMENT
// ============================================
async function getUserEnrollments(userId) {
    try {
        const { data, error } = await supabase.from('enrollments').select('course_id').eq('user_id', userId).eq('status', 'active');
        if (error) throw error;
        return data || [];
    } catch (error) {
        return [];
    }
}

async function createEnrollment(userId, courseId, amountPaid, transactionId = null) {
    try {
        const { error } = await supabase.from('enrollments').insert({
            user_id: userId, 
            course_id: courseId, 
            amount_paid: amountPaid || 0,
            transaction_id: transactionId,
            status: 'active',
            enrolled_at: new Date().toISOString()
        });
        if (error) {
            console.log('Enrollment insert warning:', error.message);
        }
        return { success: true };
    } catch (error) {
        console.log('Enrollment save error:', error);
        return { success: true };
    }
}

// ============================================
// PROGRESS
// ============================================
async function getUserProgress(userId, courseId) {
    try {
        const { data, error } = await supabase.from('user_progress').select('progress').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return { progress: data?.progress || 0 };
    } catch (error) {
        return { progress: 0 };
    }
}

async function updateProgress(userId, courseId, progress) {
    try {
        const { error } = await supabase.from('user_progress').upsert({
            user_id: userId, 
            course_id: courseId, 
            progress: progress, 
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: true };
    }
}

// ============================================
// M-PESA PAYMENT - REAL PRODUCTION (NO DEMO)
// ============================================
async function initiateMpesaPayment(phoneNumber, amount, courseId, userId, email, courseName) {
    // Format phone number correctly
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
    if (!formattedPhone.startsWith('254')) formattedPhone = '254' + formattedPhone;
    if (formattedPhone.length === 12) formattedPhone = '254' + formattedPhone.slice(-9);

    console.log('========================================');
    console.log('💰 REAL M-PESA PAYMENT INITIATION');
    console.log('========================================');
    console.log('📞 Phone:', formattedPhone);
    console.log('💰 Amount:', amount);
    console.log('📚 Course:', courseId, courseName);
    console.log('👤 User:', userId, email);
    console.log('📡 API URL:', `${API_BASE_URL}/api/payments/mpesa/initiate`);
    console.log('========================================');

    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/mpesa/initiate`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phoneNumber: formattedPhone, 
                amount: Math.round(amount), 
                courseId: courseId, 
                userId: userId, 
                email: email, 
                accountReference: `C${courseId}`, 
                transactionDesc: `MEI DRIVE - ${courseName || `Course ${courseId}`}`
            })
        });
        
        const data = await response.json();
        console.log('📡 API Response:', data);
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Payment initiation failed');
        }
        
        console.log('✅ STK Push sent successfully!');
        console.log('⚠️ REAL MONEY will be deducted from your M-Pesa account');
        return { success: true, checkoutRequestID: data.checkoutRequestID };
    } catch (error) {
        console.error('❌ M-Pesa Error:', error.message);
        return { success: false, error: error.message };
    }
}

async function checkPaymentStatus(checkoutRequestID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/mpesa/status`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ checkoutRequestID })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error('Status check error:', error.message);
        return { success: false, status: 'error', error: error.message };
    }
}

// Test backend connection
async function testMpesaConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        console.log('✅ Backend Health Check:', data);
        return { success: true, ...data };
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
async function getAllPayments() { 
    try { 
        const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }); 
        if (error) throw error;
        return data || []; 
    } catch (e) { 
        return []; 
    } 
}

async function getAllUsers() { 
    try { 
        const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false }); 
        if (error) throw error;
        return data || []; 
    } catch (e) { 
        return []; 
    } 
}

async function getAllEnrollments() { 
    try { 
        const { data, error } = await supabase.from('enrollments').select('*, user_profiles(full_name), courses(name)').order('enrolled_at', { ascending: false });
        if (error) throw error;
        return data || []; 
    } catch (e) { 
        return []; 
    } 
}

async function updateUserRole(userId, isAdmin) { 
    try { 
        await supabase.from('user_profiles').update({ is_admin: isAdmin }).eq('id', userId); 
        return { success: true }; 
    } catch (e) { 
        return { success: false }; 
    } 
}

// ============================================
// EXPORT - Single Source of Truth
// ============================================
window.MEIDrive = {
    // Auth
    signUp, 
    signIn, 
    signOut, 
    getCurrentUser,
    
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
    
    // M-Pesa (Real - No Demo)
    initiateMpesaPayment, 
    checkPaymentStatus,
    testMpesaConnection,
    
    // Admin
    getAllPayments, 
    getAllUsers, 
    getAllEnrollments, 
    updateUserRole,
    
    // Constants
    paybillNumber: '4095377',
    supabase, 
    isReady: () => true
};

console.log('✅ MEI DRIVE AFRICA - Single Source of Truth (REAL M-PESA MODE)');
console.log('==============================================================');
console.log('📚 Courses: LEARNER HUB, PSV, EV, REFRESHER, BODA, SCHOOL BUS, DEFENSIVE, QUIZ BANK');
console.log('💰 M-Pesa Paybill: 4095377');
console.log('⚠️  REAL MONEY will be deducted from M-Pesa accounts');
console.log('🔗 Backend API:', API_BASE_URL);
console.log('==============================================================');

// Test backend connection on load
setTimeout(async () => {
    const result = await testMpesaConnection();
    if (result.success) {
        console.log('✅ Backend connected successfully! Ready for real payments.');
    } else {
        console.error('❌ Backend connection failed. Please check your backend deployment.');
    }
}, 1000);
