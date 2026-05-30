// ============================================
// SINGLE SOURCE OF TRUTH: Supabase Client
// ============================================

// Supabase credentials
const SUPABASE_URL = 'https://qpqkmmkrzxlhcpccefjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU0NzIsImV4cCI6MjA5NTEwMTQ3Mn0.Vw1hexN3NKoF_y9VFBFs_NUhJgFNNMwuyzDjImUcM6s';

// Initialize Supabase client (single instance)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Export for use in other modules
window.supabaseClient = supabase;

// Fallback data (only used when Supabase tables are EMPTY, not on auth errors)
window.FALLBACK_COURSES = [
    { id: 1, title: 'Boda Boda Safety Course', description: 'Comprehensive safety training for motorcycle taxi operators.', price: 3500, duration: '2 Weeks', units: 8, icon: 'fa-motorcycle', modules: ['Introduction', 'PPE', 'Defensive Riding', 'Passenger Safety', 'Traffic Rules', 'Night Riding', 'Emergency Response', 'Assessment'] },
    { id: 2, title: 'PSV Operator Course', description: 'Professional training for matatu, bus, and taxi drivers.', price: 5000, duration: '4 Weeks', units: 12, icon: 'fa-bus', modules: ['PSV Operations', 'Customer Service', 'Passenger Safety', 'Defensive Driving', 'Vehicle Inspection', 'Emergency Response', 'Professional Ethics', 'Fleet Management', 'Route Planning', 'Stress Management', 'Legal Compliance', 'Final Exam'] },
    { id: 3, title: 'School Transport Safety', description: 'Specialized training for school bus and van drivers.', price: 4500, duration: '3 Weeks', units: 7, icon: 'fa-school', modules: ['Child Safety', 'Safe Boarding', 'Student Management', 'Emergency Evacuation', 'Route Planning', 'Parent Communication', 'Assessment'] },
    { id: 4, title: 'EV Driver and Rider', description: 'Electric vehicle operation and charging safety.', price: 4000, duration: '2 Weeks', units: 10, icon: 'fa-charging-station', modules: ['EV Basics', 'Charging Systems', 'Battery Safety', 'EV Driving', 'Regenerative Braking', 'Range Management', 'Emergency Response', 'Maintenance', 'Eco Driving', 'Final Exam'] },
    { id: 5, title: 'Driver Refresher Course', description: 'Advanced defensive driving for experienced drivers.', price: 3000, duration: '1 Week', units: 8, icon: 'fa-redo-alt', modules: ['Defensive Driving Review', 'Traffic Law Updates', 'Hazard Perception', 'Emergency Maneuvers', 'Skid Control', 'Night Driving', 'Weather Driving', 'Assessment'] },
    { id: 6, title: 'Learner Hub Complete', description: 'Complete beginner driver education.', price: 2500, duration: '6 Weeks', units: 21, icon: 'fa-graduation-cap', modules: ['Introduction', 'Fundamental Rules', 'Model Town', 'Human Factors', 'Vehicle Controls', 'Inspection', 'Observation', 'Control', 'Communication', 'Speed Management', 'Space Management', 'Emergency Manoeuvres', 'Skid Control', 'Adverse Conditions', 'Maintenance', 'Conditions of Carriage', 'Hazardous Materials', 'Emergency Procedures', 'Work Planning', 'Customer Care', 'Final Exam'] }
];

window.FALLBACK_QUIZ = [
    { question_text: "What does a STOP sign mean?", option_a: "Slow down only", option_b: "Continue carefully", option_c: "Come to a complete stop", option_d: "Overtake carefully", correct_option: "C", explanation: "A STOP sign requires a complete stop at the stop line." },
    { question_text: "Defensive driving means:", option_a: "Aggressive driving", option_b: "Anticipating and avoiding danger", option_c: "Driving fast", option_d: "Ignoring rules", correct_option: "B", explanation: "Defensive driving anticipates danger before it happens." }
];

console.log('✅ Supabase SSOT initialized');
