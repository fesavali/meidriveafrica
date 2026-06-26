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
    { id: 1, name: '🚗 LEARNER HUB', short_name: 'LEARNER HUB', description: 'Complete driver training for new drivers covering fundamental rules, vehicle controls, observation, speed management, parking, and NTSA exam preparation.', price: 2999, duration: '8 weeks', icon: 'fa-car', lessons_count: 21, color: '#F39C12' },
    { id: 2, name: '🚌 PSV PROFESSIONAL', short_name: 'PSV PROFESSIONAL', description: 'Public Service Vehicle certification with passenger management, customer care, safety protocols, NTSA compliance, and conductor professionalism.', price: 3999, duration: '8 weeks', icon: 'fa-bus', lessons_count: 16, color: '#9B59B6' },
    { id: 3, name: '⚡ EV DRIVER & RIDER', short_name: 'EV DRIVER', description: 'Electric vehicle operations, charging safety, battery management, regenerative braking, and eco-driving techniques for EVs.', price: 1999, duration: '5 weeks', icon: 'fa-car-battery', lessons_count: 10, color: '#3498DB' },
    { id: 4, name: '🔄 DRIVER REFRESHER', short_name: 'REFRESHER', description: 'Advanced defensive driving, skill enhancement, hazard perception, professional driver excellence, and breaking bad habits.', price: 1499, duration: '4 weeks', icon: 'fa-sync-alt', lessons_count: 8, color: '#2ECC71' },
    { id: 5, name: '🏍️ BODA BODA SAFETY', short_name: 'BODA SAFETY', description: 'Professional motorcycle rider training with PPE, defensive riding, passenger safety, road etiquette, and accident prevention.', price: 2499, duration: '6 weeks', icon: 'fa-motorcycle', lessons_count: 26, color: '#E67E22' },
    { id: 6, name: '🏫 SCHOOL BUS/VAN', short_name: 'SCHOOL BUS', description: 'Specialized training for school transport drivers focusing on child safety, boarding/alighting procedures, and emergency response.', price: 2999, duration: '7 weeks', icon: 'fa-school', lessons_count: 7, color: '#1ABC9C' },
    { id: 7, name: '🛡️ DEFENSIVE DRIVER', short_name: 'DEFENSIVE', description: 'Master defensive driving techniques including hazard perception, risk management, space cushion driving, and collision avoidance.', price: 2499, duration: '6 weeks', icon: 'fa-shield-alt', lessons_count: 30, color: '#E74C3C' },
    { id: 8, name: '📚 QUIZ BANK', short_name: 'QUIZ BANK', description: '1000+ NTSA-style exam questions covering road signs, highway code, defensive driving, traffic rules, and professional conduct.', price: 999, duration: 'Self-paced', icon: 'fa-question-circle', lessons_count: 15, color: '#00ff88' }
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
        
        // Create profile entry
        const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            full_name: fullName || email.split('@')[0],
            is_admin: false,
            created_at: new Date().toISOString()
        });
        
        if (profileError) {
            console.error('Profile creation failed:', profileError);
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

// Sends a password-reset email. The link in that email lands the user
// back on update-password.html with a recovery token in the URL, which
// the Supabase client auto-detects (detectSessionInUrl defaults to true).
async function resetPassword(email) {
    try {
        const redirectTo = `${window.location.origin}/update-password.html`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Must be called from update-password.html after following a reset-password
// email link — relies on the recovery session Supabase establishes from the
// token in the URL, not on the user being already logged in normally.
async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
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
        
        // Use maybeSingle() to avoid errors if profile missing
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
        const { data, error } = await supabase.from('courses').select('*').order('id');
        if (error) throw error;
        if (data && data.length > 0) {
            return data.map(c => {
                const predefined = PREDEFINED_COURSES.find(pc => pc.id === c.id);
                return {
                    ...c,
                    short_name: c.short_name || predefined?.short_name || c.name,
                    icon: c.icon || predefined?.icon || 'fa-car',
                    color: c.color || predefined?.color || '#00ff88',
                    lessons_count: c.lessons_count ?? predefined?.lessons_count ?? 0
                };
            });
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
// COURSE IMAGES (Supabase Storage)
// ============================================
const COURSE_IMAGE_BUCKET = 'course-images';
const MAX_COURSE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB, must match the bucket's file_size_limit
const ALLOWED_COURSE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Client-side check for fast feedback. The real enforcement is the
// bucket's file_size_limit/allowed_mime_types and the Storage RLS
// policy from migration 0002_course_images.sql — this is just UX.
function validateCourseImageFile(file) {
    if (!ALLOWED_COURSE_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Only JPEG, PNG, WEBP or GIF images are allowed' };
    }
    if (file.size > MAX_COURSE_IMAGE_BYTES) {
        return { valid: false, error: 'Image must be smaller than 5MB' };
    }
    return { valid: true };
}

async function uploadCourseImage(file) {
    if (!file) return null;

    const check = validateCourseImageFile(file);
    if (!check.valid) throw new Error(check.error);

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
        .from(COURSE_IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(COURSE_IMAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
}

// Best-effort cleanup — never throws, since a failed delete shouldn't
// block whatever course operation triggered it.
async function deleteCourseImage(path) {
    if (!path) return;
    try {
        await supabase.storage.from(COURSE_IMAGE_BUCKET).remove([path]);
    } catch (error) {
        console.error('Failed to delete course image:', error.message);
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
// ADMIN: COURSE CRUD (with image support)
// ============================================
async function addCourse(courseData, imageFile = null) {
    try {
        let image_url = null;
        let image_path = null;

        if (imageFile) {
            const uploaded = await uploadCourseImage(imageFile);
            image_url = uploaded.url;
            image_path = uploaded.path;
        }

        const { data, error } = await supabase
            .from('courses')
            .insert({ ...courseData, image_url, image_path })
            .select()
            .single();

        if (error) {
            // Don't leave an orphaned file in storage if the insert failed
            if (image_path) await deleteCourseImage(image_path);
            throw error;
        }

        return { success: true, course: data };
    } catch (error) {
        console.error('addCourse error:', error.message);
        return { success: false, error: error.message };
    }
}

async function updateCourse(id, courseData, imageFile = null) {
    try {
        const updates = { ...courseData };
        let oldImagePath = null;

        if (imageFile) {
            const { data: existing } = await supabase
                .from('courses')
                .select('image_path')
                .eq('id', id)
                .maybeSingle();
            oldImagePath = existing?.image_path || null;

            const uploaded = await uploadCourseImage(imageFile);
            updates.image_url = uploaded.url;
            updates.image_path = uploaded.path;
        }

        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Only clean up the old image after the row update succeeded
        if (imageFile && oldImagePath) {
            await deleteCourseImage(oldImagePath);
        }

        return { success: true, course: data };
    } catch (error) {
        console.error('updateCourse error:', error.message);
        return { success: false, error: error.message };
    }
}

async function updateCoursePrice(id, price) {
    try {
        const { error } = await supabase.from('courses').update({ price }).eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('updateCoursePrice error:', error.message);
        return { success: false, error: error.message };
    }
}

async function deleteCourse(id) {
    try {
        const { data: existing } = await supabase
            .from('courses')
            .select('image_path')
            .eq('id', id)
            .maybeSingle();

        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;

        if (existing?.image_path) await deleteCourseImage(existing.image_path);

        return { success: true };
    } catch (error) {
        console.error('deleteCourse error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// REAL-TIME COURSE SUBSCRIPTION
// Returns an unsubscribe function — call it on page teardown to
// avoid leaking a Supabase realtime channel per page load.
// ============================================
function subscribeToCourses(callback) {
    const channel = supabase
        .channel('courses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, async () => {
            const courses = await getAllCourses();
            callback(courses);
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
}

// ============================================
// M-PESA PAYMENT - REAL PRODUCTION (NO DEMO)
// ============================================
async function initiateMpesaPayment(phoneNumber, amount, courseId, userId, email, courseName) {
    // Format phone number correctly for M-Pesa (254XXXXXXXXX)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+254')) {
        formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
    }
    
    // Final validation
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
        return { 
            success: false, 
            error: 'Invalid phone number. Please use format: 0712345678 or 254712345678'
        };
    }

    console.log('========================================');
    console.log('💰 REAL M-PESA PAYMENT INITIATION');
    console.log('========================================');
    console.log('📞 Phone:', formattedPhone);
    console.log('💰 Amount: KES', amount);
    console.log('📚 Course:', courseId, courseName);
    console.log('👤 User:', userId, email);
    console.log('📡 Endpoint:', `${API_BASE_URL}/api/payments/mpesa/initiate`);
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
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            throw new Error(data.error || `HTTP ${response.status}: Payment initiation failed`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Payment initiation failed');
        }
        
        console.log('✅ STK Push sent successfully!');
        console.log('⚠️ REAL MONEY will be deducted from M-Pesa account');
        console.log('📋 Checkout Request ID:', data.checkoutRequestID);
        
        return { 
            success: true, 
            checkoutRequestID: data.checkoutRequestID,
            message: 'STK Push sent. Check your phone for M-Pesa prompt.'
        };
        
    } catch (error) {
        console.error('❌ M-Pesa Error:', error.message);
        
        return { 
            success: false, 
            error: error.message || 'Payment initiation failed. Please try again.',
            code: 'MPESA_ERROR'
        };
    }
}

async function checkPaymentStatus(checkoutRequestID) {
    if (!checkoutRequestID) {
        return { 
            success: false, 
            error: 'Checkout Request ID is required',
            status: 'error'
        };
    }

    console.log(`🔍 Checking payment status for: ${checkoutRequestID}`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/mpesa/status`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ checkoutRequestID })
        });
        
        const data = await response.json();
        console.log('📡 Status Response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Status check failed');
        }
        
        return data;
    } catch (error) {
        console.error('❌ Status check error:', error.message);
        return { 
            success: false, 
            status: 'error', 
            error: error.message,
            code: 'STATUS_CHECK_ERROR'
        };
    }
}

// Test backend connection (for debugging)
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
    resetPassword,
    updatePassword,
    getCurrentUser,
    
    // Courses
    getAllCourses, 
    getCourseById, 
    getLessonsByCourseId,
    addCourse,
    updateCourse,
    updateCoursePrice,
    deleteCourse,
    subscribeToCourses,

    // Course images
    uploadCourseImage,
    deleteCourseImage,
    validateCourseImageFile,
    
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