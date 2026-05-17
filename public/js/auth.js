// public/js/auth.js
import { supabase } from './supabase.js';

let currentUser = null;
let authListeners = [];
let sessionCheckInterval = null;

export function onAuthChange(callback) {
    authListeners.push(callback);
    return () => {
        const index = authListeners.indexOf(callback);
        if (index > -1) authListeners.splice(index, 1);
    };
}

function notifyAuthChange() {
    authListeners.forEach(callback => callback(currentUser));
}

// Session expiration check (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let lastActivity = Date.now();

export function updateActivity() {
    lastActivity = Date.now();
}

export function startSessionMonitor() {
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    sessionCheckInterval = setInterval(async () => {
        if (currentUser && (Date.now() - lastActivity) > SESSION_TIMEOUT) {
            await logout();
            window.location.href = '/login.html?expired=true';
            showNotification('Session expired. Please login again.', 'warning');
        }
    }, 60000);
    
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, updateActivity);
    });
}

// Password validation (strong)
export function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');
    return { valid: errors.length === 0, errors };
}

// Email validation
export function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// Rate limiting (5 attempts per 15 minutes)
let loginAttempts = [];
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW = 15 * 60 * 1000;

function checkRateLimit(email) {
    const now = Date.now();
    loginAttempts = loginAttempts.filter(attempt => now - attempt.timestamp < LOGIN_WINDOW);
    const userAttempts = loginAttempts.filter(attempt => attempt.email === email);
    return userAttempts.length < MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(email, success) {
    loginAttempts.push({ email, timestamp: Date.now(), success });
}

// Email verification check
export async function isEmailVerified() {
    if (!currentUser) return false;
    const { data } = await supabase.auth.getUser();
    return data.user?.email_confirmed_at !== null;
}

// Login with rate limiting
export async function login(email, password) {
    if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
    }
    
    if (!checkRateLimit(email)) {
        return { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        recordLoginAttempt(email, false);
        return { success: false, error: error.message === 'Invalid login credentials' 
            ? 'Invalid email or password' : error.message };
    }
    
    recordLoginAttempt(email, true);
    
    if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { success: false, error: 'Please verify your email before logging in. Check your inbox.' };
    }
    
    await loadCurrentUser();
    updateActivity();
    return { success: true, user: currentUser };
}

// Register with validation
export async function register(email, password, fullName) {
    if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
    }
    
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        return { success: false, error: `Password must have: ${passwordCheck.errors.join(', ')}` };
    }
    
    if (!fullName || fullName.trim().length < 2) {
        return { success: false, error: 'Full name is required (minimum 2 characters)' };
    }
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/login.html?verified=true`
        }
    });
    
    if (error) return { success: false, error: error.message };
    
    if (data.user) {
        await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'learner'
        });
    }
    
    return { success: true, message: 'Verification email sent! Please check your inbox.' };
}

// Logout
export async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    notifyAuthChange();
}

// Load current user with error handling
export async function loadCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            currentUser = null;
            notifyAuthChange();
            return null;
        }
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
        
        if (error) console.error('Profile fetch error:', error);
        
        currentUser = {
            id: session.user.id,
            email: session.user.email,
            emailVerified: session.user.email_confirmed_at !== null,
            ...(profile || {})
        };
        
        notifyAuthChange();
        return currentUser;
    } catch (error) {
        console.error('Error loading user:', error);
        currentUser = null;
        notifyAuthChange();
        return null;
    }
}

// Check course access
export async function hasCourseAccess(courseId) {
    if (!currentUser) return false;
    
    try {
        const { data: course } = await supabase
            .from('courses')
            .select('type')
            .eq('id', courseId)
            .single();
        
        if (course?.type === 'free') return true;
        
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('course_id', courseId)
            .maybeSingle();
        
        return !!enrollment;
    } catch (error) {
        console.error('Course access check error:', error);
        return false;
    }
}

// Password reset
export async function resetPassword(email) {
    if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
    });
    
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Password reset email sent!' };
}

// Initialize
supabase.auth.onAuthStateChange(() => {
    loadCurrentUser();
});

startSessionMonitor();
loadCurrentUser();
