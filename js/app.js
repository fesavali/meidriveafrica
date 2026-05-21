// ============================================
// MEI DRIVE AFRICA - Main Application JS
// Driver Training Platform with Dashboard
// ============================================

// ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = 'https://jeksrwrzzrczamxijvwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== GLOBAL STATE ==========
let currentUser = null;
let allCourses = [];
let userEnrollments = [];
let currentView = 'dashboard'; // dashboard, courses, profile

// ========== DOM ELEMENTS ==========
const elements = {
    loadingSpinner: document.getElementById('loadingSpinner'),
    toast: document.getElementById('toast'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    userInfoNav: document.getElementById('userInfoNav'),
    authLinks: document.getElementById('authLinks'),
    mobileAuthLinks: document.getElementById('mobileAuthLinks'),
    mobileUserInfo: document.getElementById('mobileUserInfo'),
    mobileUserName: document.getElementById('mobileUserName'),
    logoutBtn: document.getElementById('logoutBtnNav'),
    mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
    loginBtn: document.getElementById('loginBtnNav'),
    registerBtn: document.getElementById('registerBtnNav'),
    mobileLoginBtn: document.getElementById('mobileLoginBtn'),
    mobileRegisterBtn: document.getElementById('mobileRegisterBtn'),
    coursesContainer: document.getElementById('coursesContainer'),
    activeCoursesContainer: document.getElementById('activeCoursesContainer'),
    allCoursesContainer: document.getElementById('allCoursesContainer'),
    enrolledCount: document.getElementById('enrolledCount'),
    completedCount: document.getElementById('completedCount'),
    avgProgress: document.getElementById('avgProgress'),
    totalCoursesSpan: document.getElementById('totalCourses'),
    dashboardMain: document.getElementById('dashboardMain'),
    heroSection: document.getElementById('heroSection'),
    statsSection: document.getElementById('statsSection'),
    contactSection: document.getElementById('contactSection'),
    navDashboard: document.getElementById('navDashboard'),
    navCourses: document.getElementById('navCourses'),
    navHome: document.getElementById('navHome'),
    navContact: document.getElementById('navContact'),
    exploreCoursesBtn: document.getElementById('exploreCoursesBtn'),
    refreshEnrollments: document.getElementById('refreshEnrollments'),
    heroGetStarted: document.getElementById('heroGetStarted')
};

// ========== HELPER FUNCTIONS ==========

/**
 * Show toast notification
 */
function showToast(message, isError = false) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.className = `toast ${isError ? 'error' : ''}`;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 4000);
}

/**
 * Set loading spinner state
 */
function setLoading(loading) {
    if (!elements.loadingSpinner) return;
    if (loading) {
        elements.loadingSpinner.classList.add('active');
    } else {
        elements.loadingSpinner.classList.remove('active');
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * Format currency in KES
 */
function formatCurrency(amount) {
    if (amount === 0) return 'FREE';
    return `KES ${amount.toLocaleString()}`;
}

/**
 * Get course icon based on course name
 */
function getCourseIcon(courseName) {
    const icons = {
        'learner': '🚗',
        'psv': '🚌',
        'ev': '⚡',
        'electric': '⚡',
        'boda': '🏍️',
        'motorcycle': '🏍️',
        'defensive': '🛡️',
        'refresher': '🔄',
        'automatic': '🚙',
        'truck': '🚛'
    };
    const lowerName = (courseName || '').toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
        if (lowerName.includes(key)) return icon;
    }
    return '🚗';
}

// ========== AUTHENTICATION FUNCTIONS ==========

/**
 * Update UI based on authentication state
 */
async function updateAuthUI() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        
        if (currentUser) {
            // Get user profile
            let displayName = currentUser.email?.split('@')[0] || 'Driver';
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', currentUser.id)
                    .maybeSingle();
                if (profile?.full_name) displayName = profile.full_name;
            } catch (err) {
                console.log('Profiles table not ready, using email name');
            }
            
            // Update UI elements
            if (elements.userNameDisplay) elements.userNameDisplay.textContent = displayName;
            if (elements.mobileUserName) elements.mobileUserName.textContent = displayName;
            
            if (elements.authLinks) elements.authLinks.style.display = 'none';
            if (elements.userInfoNav) elements.userInfoNav.style.display = 'flex';
            if (elements.mobileAuthLinks) elements.mobileAuthLinks.style.display = 'none';
            if (elements.mobileUserInfo) elements.mobileUserInfo.style.display = 'block';
        } else {
            if (elements.authLinks) elements.authLinks.style.display = 'flex';
            if (elements.userInfoNav) elements.userInfoNav.style.display = 'none';
            if (elements.mobileAuthLinks) elements.mobileAuthLinks.style.display = 'block';
            if (elements.mobileUserInfo) elements.mobileUserInfo.style.display = 'none';
        }
    } catch (err) {
        console.error('Auth UI update error:', err);
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    setLoading(true);
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('mei_enrollments');
        showToast('Logged out successfully');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    } catch (err) {
        console.error('Logout error:', err);
        showToast('Error logging out', true);
    } finally {
        setLoading(false);
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/login.html';
}

/**
 * Redirect to register page
 */
function redirectToRegister() {
    window.location.href = '/register.html';
}

// ========== COURSE FUNCTIONS ==========

/**
 * Fetch all courses from Supabase
 */
async function fetchAllCourses() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            allCourses = data;
            if (elements.totalCoursesSpan) {
                elements.totalCoursesSpan.textContent = data.length.toString();
            }
            return allCourses;
        }
        
        // Fallback demo courses if database is empty
        allCourses = [
            { id: 1, name: 'Learner Hub (Manual)', description: 'Complete beginner course for manual transmission following NTSA syllabus. Perfect for first-time drivers.', price: 8500, type: 'premium', icon: '🚗', duration: '4 weeks', modules: 12 },
            { id: 2, name: 'PSV Driver Training', description: 'Public Service Vehicle certification course. Required for taxi, matatu, and bus drivers.', price: 12500, type: 'premium', icon: '🚌', duration: '6 weeks', modules: 18 },
            { id: 3, name: 'EV (Electric Vehicle)', description: 'Master electric vehicle driving techniques, charging protocols, and battery management.', price: 15000, type: 'premium', icon: '⚡', duration: '3 weeks', modules: 8 },
            { id: 4, name: 'Boda Boda Safety', description: 'Motorcycle defensive riding, road safety, and NTSA compliance for boda boda operators.', price: 0, type: 'free', icon: '🏍️', duration: '2 weeks', modules: 6 },
            { id: 5, name: 'Defensive Driving', description: 'Advanced hazard perception, crash avoidance techniques, and emergency handling.', price: 9500, type: 'premium', icon: '🛡️', duration: '3 weeks', modules: 10 },
            { id: 6, name: 'Refresher Course', description: 'Boost confidence for licensed drivers. Perfect for those returning to driving after a break.', price: 6500, type: 'premium', icon: '🔄', duration: '2 weeks', modules: 6 },
            { id: 7, name: 'Automatic Transmission', description: 'Specialized training for automatic vehicles. Easier and more convenient.', price: 7500, type: 'premium', icon: '🚙', duration: '3 weeks', modules: 8 },
            { id: 8, name: 'Truck/Heavy Commercial', description: 'For trucks, lorries, and heavy commercial vehicles. NTSA certified.', price: 18000, type: 'premium', icon: '🚛', duration: '8 weeks', modules: 20 }
        ];
        
        if (elements.totalCoursesSpan) {
            elements.totalCoursesSpan.textContent = allCourses.length.toString();
        }
        return allCourses;
    } catch (err) {
        console.error('Error fetching courses:', err);
        showToast('Failed to load courses. Using demo data.', true);
        return allCourses;
    }
}

/**
 * Fetch user enrollments
 */
async function fetchUserEnrollments() {
    if (!currentUser) return [];
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', currentUser.id);
        
        if (error && error.code !== '42P01') throw error;
        
        if (data) {
            userEnrollments = data;
            return userEnrollments;
        }
    } catch (err) {
        console.log('Enrollments table may not exist, using localStorage fallback');
    }
    
    // Fallback to localStorage
    const localEnrollments = localStorage.getItem('mei_enrollments');
    if (localEnrollments) {
        userEnrollments = JSON.parse(localEnrollments);
    } else {
        userEnrollments = [];
    }
    return userEnrollments;
}

/**
 * Enroll user in a course
 */
async function enrollInCourse(courseId) {
    if (!currentUser) {
        showToast('Please login to enroll in courses', true);
        setTimeout(() => redirectToLogin(), 1500);
        return false;
    }
    
    setLoading(true);
    
    try {
        // Check if already enrolled
        const existing = userEnrollments.find(e => e.course_id === courseId);
        if (existing) {
            showToast('You are already enrolled in this course', true);
            setLoading(false);
            return false;
        }
        
        const newEnrollment = {
            user_id: currentUser.id,
            course_id: courseId,
            status: 'active',
            progress: 0,
            enrolled_at: new Date().toISOString()
        };
        
        // Try Supabase insert
        try {
            const { error } = await supabase.from('enrollments').insert([newEnrollment]);
            if (!error) {
                userEnrollments.push(newEnrollment);
                showToast('Successfully enrolled! 🎉');
                await loadDashboardData();
                setLoading(false);
                return true;
            }
        } catch (err) {
            console.log('Supabase insert failed, using localStorage');
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('mei_enrollments');
        let localEnrolls = stored ? JSON.parse(stored) : [];
        localEnrolls.push(newEnrollment);
        localStorage.setItem('mei_enrollments', JSON.stringify(localEnrolls));
        userEnrollments = localEnrolls;
        showToast('Enrolled successfully! 🎉');
        await loadDashboardData();
        setLoading(false);
        return true;
    } catch (err) {
        console.error('Enrollment error:', err);
        showToast('Failed to enroll. Please try again.', true);
        setLoading(false);
        return false;
    }
}

/**
 * Update course progress
 */
async function updateProgress(courseId, newProgress) {
    if (!currentUser) return;
    
    const enrollment = userEnrollments.find(e => e.course_id === courseId);
    if (!enrollment) return;
    
    enrollment.progress = Math.min(100, newProgress);
    enrollment.status = enrollment.progress >= 100 ? 'completed' : 'active';
    
    try {
        const { error } = await supabase
            .from('enrollments')
            .update({ progress: enrollment.progress, status: enrollment.status })
            .eq('id', enrollment.id);
        
        if (error && error.code !== '42P01') throw error;
    } catch (err) {
        // localStorage fallback
        localStorage.setItem('mei_enrollments', JSON.stringify(userEnrollments));
    }
    
    await loadDashboardData();
    showToast(`Progress updated to ${enrollment.progress}%`);
}

// ========== RENDER FUNCTIONS ==========

/**
 * Display skeleton loading cards
 */
function showSkeletons(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-icon"></div><div class="skeleton-title"></div><div class="skeleton-text"></div><div class="skeleton-price"></div></div>
        <div class="skeleton-card"><div class="skeleton-icon"></div><div class="skeleton-title"></div><div class="skeleton-text"></div><div class="skeleton-price"></div></div>
        <div class="skeleton-card"><div class="skeleton-icon"></div><div class="skeleton-title"></div><div class="skeleton-text"></div><div class="skeleton-price"></div></div>
        <div class="skeleton-card"><div class="skeleton-icon"></div><div class="skeleton-title"></div><div class="skeleton-text"></div><div class="skeleton-price"></div></div>
    `;
}

/**
 * Render all available courses
 */
function renderAllCourses() {
    if (!elements.allCoursesContainer) return;
    
    if (!allCourses.length) {
        elements.allCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-database" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No courses available. Please contact admin.</p>
            </div>
        `;
        return;
    }
    
    const enrolledIds = userEnrollments.map(e => e.course_id);
    const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id));
    
    if (availableCourses.length === 0) {
        elements.allCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #00FF88; margin-bottom: 1rem;"></i>
                <p>You've enrolled in all courses! Great dedication to your driving education.</p>
            </div>
        `;
        return;
    }
    
    elements.allCoursesContainer.innerHTML = availableCourses.map(course => {
        const isFree = course.price === 0 || course.type === 'free';
        const icon = course.icon || getCourseIcon(course.name);
        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-icon">${icon}</div>
                <div class="course-badge ${isFree ? 'free-badge' : 'premium-badge'}">${isFree ? 'FREE' : 'PREMIUM'}</div>
                <h3>${escapeHtml(course.name)}</h3>
                <p>${escapeHtml((course.description || 'NTSA approved driving course').substring(0, 100))}${(course.description || '').length > 100 ? '...' : ''}</p>
                <div class="course-meta">
                    <span><i class="far fa-clock"></i> ${course.duration || 'Flexible'}</span>
                    <span><i class="fas fa-layer-group"></i> ${course.modules || 8} modules</span>
                </div>
                <div class="course-price ${isFree ? 'free' : 'premium'}">${formatCurrency(course.price)}</div>
                <button class="btn-view enroll-btn" data-id="${course.id}">Enroll Now →</button>
            </div>
        `;
    }).join('');
    
    // Attach enroll events
    document.querySelectorAll('#allCoursesContainer .enroll-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const courseId = parseInt(btn.dataset.id);
            await enrollInCourse(courseId);
        });
    });
    
    // Card click for details
    document.querySelectorAll('#allCoursesContainer .course-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('enroll-btn')) return;
            const courseId = card.dataset.courseId;
            viewCourseDetails(courseId);
        });
    });
}

/**
 * Render user's active courses
 */
function renderActiveCourses() {
    if (!elements.activeCoursesContainer) return;
    
    if (!userEnrollments.length) {
        elements.activeCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>You haven't enrolled in any courses yet.</p>
                <p style="margin-top: 0.5rem;">Click "Explore New Courses" to get started on your driving journey!</p>
            </div>
        `;
        return;
    }
    
    const enrolledIds = userEnrollments.map(e => e.course_id);
    const enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.id));
    
    if (enrolledCourses.length === 0) {
        elements.activeCoursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No active courses found</p>
            </div>
        `;
        return;
    }
    
    elements.activeCoursesContainer.innerHTML = enrolledCourses.map(course => {
        const enrollment = userEnrollments.find(e => e.course_id === course.id);
        const progress = enrollment?.progress || 0;
        const status = enrollment?.status || 'active';
        const icon = course.icon || getCourseIcon(course.name);
        const isCompleted = status === 'completed';
        
        return `
            <div class="course-card active-course" data-course-id="${course.id}">
                <div class="course-icon">${icon}</div>
                <div class="course-badge ${isCompleted ? 'completed-badge' : 'active-badge'}">
                    ${isCompleted ? '✓ COMPLETED' : 'IN PROGRESS'}
                </div>
                <h3>${escapeHtml(course.name)}</h3>
                <p>${escapeHtml((course.description || '').substring(0, 80))}${(course.description || '').length > 80 ? '...' : ''}</p>
                <div class="course-progress">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="progress-info">
                    <span>${progress}% complete</span>
                    ${!isCompleted ? `<button class="btn-progress update-progress-btn" data-id="${course.id}" data-progress="${Math.min(progress + 20, 100)}">+20% Practice</button>` : 
                                    `<span class="completion-date"><i class="fas fa-calendar-check"></i> Certified</span>`}
                </div>
                <div class="course-meta-footer">
                    <span><i class="fas fa-trophy"></i> NTSA Certified</span>
                    <button class="btn-continue" data-id="${course.id}">${isCompleted ? 'View Certificate' : 'Continue →'}</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach progress update events
    document.querySelectorAll('.update-progress-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const courseId = parseInt(btn.dataset.id);
            const newProgress = parseInt(btn.dataset.progress);
            updateProgress(courseId, newProgress);
        });
    });
    
    // Attach continue/view events
    document.querySelectorAll('.btn-continue').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const courseId = parseInt(btn.dataset.id);
            viewCourseDetails(courseId);
        });
    });
    
    // Card click
    document.querySelectorAll('#activeCoursesContainer .active-course').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-progress-btn') || 
                e.target.classList.contains('btn-continue')) return;
            const courseId = card.dataset.courseId;
            viewCourseDetails(courseId);
        });
    });
}

/**
 * Render dashboard stats
 */
function renderStats() {
    const totalEnrolled = userEnrollments.length;
    const completedCount = userEnrollments.filter(e => e.progress >= 100 || e.status === 'completed').length;
    const totalProgress = userEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const avgProgress = totalEnrolled ? Math.floor(totalProgress / totalEnrolled) : 0;
    
    if (elements.enrolledCount) elements.enrolledCount.textContent = totalEnrolled;
    if (elements.completedCount) elements.completedCount.textContent = completedCount;
    if (elements.avgProgress) elements.avgProgress.textContent = `${avgProgress}%`;
}

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    setLoading(true);
    await fetchAllCourses();
    await fetchUserEnrollments();
    renderActiveCourses();
    renderAllCourses();
    renderStats();
    setLoading(false);
}

/**
 * View course details (redirect to course page)
 */
function viewCourseDetails(courseId) {
    window.location.href = `/course.html?id=${courseId}`;
}

// ========== UI NAVIGATION FUNCTIONS ==========

/**
 * Show dashboard view
 */
function showDashboard() {
    currentView = 'dashboard';
    if (elements.dashboardMain) elements.dashboardMain.style.display = 'block';
    if (elements.heroSection) elements.heroSection.style.display = 'none';
    if (elements.contactSection) elements.contactSection.style.display = 'none';
    loadDashboardData();
}

/**
 * Show home/landing view
 */
function showHome() {
    currentView = 'home';
    if (elements.dashboardMain) elements.dashboardMain.style.display = 'none';
    if (elements.heroSection) elements.heroSection.style.display = 'block';
    if (elements.contactSection) elements.contactSection.style.display = 'block';
    // Reload courses for hero section if needed
    fetchAllCourses();
}

/**
 * Show contact view
 */
function showContact() {
    currentView = 'contact';
    if (elements.dashboardMain) elements.dashboardMain.style.display = 'none';
    if (elements.heroSection) elements.heroSection.style.display = 'block';
    if (elements.contactSection) elements.contactSection.style.display = 'block';
    // Scroll to contact
    setTimeout(() => {
        if (elements.contactSection) {
            elements.contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

/**
 * Scroll to courses section
 */
function scrollToCourses() {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== MOBILE MENU FUNCTIONS ==========

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('mobileNavClose');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');
    
    if (!menuBtn || !mobileNav || !overlay) return;
    
    const openMenu = () => {
        mobileNav.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeMenu = () => {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// ========== INITIALIZATION ==========

/**
 * Seed demo courses if database is empty
 */
async function seedDemoCoursesIfNeeded() {
    try {
        const { data: existing, error } = await supabase
            .from('courses')
            .select('id')
            .limit(1);
        
        if (error && error.code !== '42P01') return;
        
        if (!existing || existing.length === 0) {
            console.log('Seeding demo courses...');
            const demoCourses = [
                { name: 'Learner Hub (Manual)', description: 'Complete beginner course for manual transmission following NTSA syllabus.', price: 8500, type: 'premium', icon: '🚗', duration: '4 weeks', modules: 12 },
                { name: 'PSV Driver Training', description: 'Public Service Vehicle certification for taxi, matatu, and bus drivers.', price: 12500, type: 'premium', icon: '🚌', duration: '6 weeks', modules: 18 },
                { name: 'EV (Electric Vehicle)', description: 'Master electric vehicle driving techniques and charging protocols.', price: 15000, type: 'premium', icon: '⚡', duration: '3 weeks', modules: 8 },
                { name: 'Boda Boda Safety', description: 'Motorcycle defensive riding and NTSA compliance.', price: 0, type: 'free', icon: '🏍️', duration: '2 weeks', modules: 6 },
                { name: 'Defensive Driving', description: 'Advanced hazard perception and crash avoidance techniques.', price: 9500, type: 'premium', icon: '🛡️', duration: '3 weeks', modules: 10 },
                { name: 'Refresher Course', description: 'Boost confidence for licensed drivers returning after a break.', price: 6500, type: 'premium', icon: '🔄', duration: '2 weeks', modules: 6 }
            ];
            
            for (const course of demoCourses) {
                await supabase.from('courses').insert([course]);
            }
            showToast('Demo courses loaded successfully!');
        }
    } catch (err) {
        console.log('Seed skip or error:', err);
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Auth buttons
    if (elements.loginBtn) elements.loginBtn.addEventListener('click', redirectToLogin);
    if (elements.registerBtn) elements.registerBtn.addEventListener('click', redirectToRegister);
    if (elements.mobileLoginBtn) elements.mobileLoginBtn.addEventListener('click', redirectToLogin);
    if (elements.mobileRegisterBtn) elements.mobileRegisterBtn.addEventListener('click', redirectToRegister);
    if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', handleLogout);
    if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    if (elements.navDashboard) elements.navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            showDashboard();
        } else {
            redirectToLogin();
        }
    });
    
    if (elements.navCourses) elements.navCourses.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCourses();
        if (elements.heroSection) elements.heroSection.style.display = 'block';
        if (elements.dashboardMain) elements.dashboardMain.style.display = 'none';
    });
    
    if (elements.navHome) elements.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        showHome();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    if (elements.navContact) elements.navContact.addEventListener('click', (e) => {
        e.preventDefault();
        showContact();
    });
    
    // Dashboard buttons
    if (elements.exploreCoursesBtn) {
        elements.exploreCoursesBtn.addEventListener('click', () => {
            scrollToCourses();
        });
    }
    
    if (elements.refreshEnrollments) {
        elements.refreshEnrollments.addEventListener('click', () => {
            loadDashboardData();
        });
    }
    
    if (elements.heroGetStarted) {
        elements.heroGetStarted.addEventListener('click', () => {
            if (currentUser) {
                scrollToCourses();
            } else {
                redirectToRegister();
            }
        });
    }
}

/**
 * Main initialization function
 */
async function init() {
    console.log('MEI DRIVE AFRICA - Initializing application...');
    
    // Setup mobile menu
    initMobileMenu();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check authentication
    await updateAuthUI();
    
    // Seed demo courses if needed
    await seedDemoCoursesIfNeeded();
    
    // Load initial data
    if (currentUser) {
        showDashboard();
    } else {
        showHome();
        await fetchAllCourses();
        renderAllCourses();
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI();
        if (event === 'SIGNED_IN') {
            showDashboard();
        } else if (event === 'SIGNED_OUT') {
            showHome();
        }
    });
    
    console.log('Application initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging (optional)
window.meiDrive = {
    supabase,
    getCurrentUser: () => currentUser,
    refreshData: loadDashboardData
};
