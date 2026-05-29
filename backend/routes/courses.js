// routes/courses.js
// REAL PRODUCTION - MEI DRIVE AFRICA

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase directly (no external config file)
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUyNTQ3MiwiZXhwIjoyMDk1MTAxNDcyfQ.8xHkQ3W5jZR2gZmDvVXq7jKyB5tQnC2ySmY9aBcfVpA'
);

// Helper: Verify user from token
async function verifyUser(token) {
    if (!token) return null;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// Helper: Get user enrollments map
async function getUserEnrollmentsMap(userId) {
    if (!userId) return new Map();
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, progress')
        .eq('user_id', userId);
    
    const map = new Map();
    enrollments?.forEach(e => map.set(e.course_id, e));
    return map;
}

// =====================================================
// GET ALL COURSES (Public)
// =====================================================
router.get('/', async (req, res) => {
    try {
        // Get user from token if provided
        const authHeader = req.headers.authorization;
        let userId = null;
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const user = await verifyUser(token);
            if (user) userId = user.id;
        }
        
        // Fetch all courses
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        // If user is logged in, get enrollment status
        if (userId) {
            const enrollmentMap = await getUserEnrollmentsMap(userId);
            
            const coursesWithEnrollment = courses.map(course => ({
                ...course,
                is_enrolled: enrollmentMap.has(course.id),
                progress: enrollmentMap.get(course.id)?.progress || 0
            }));
            
            return res.json({
                success: true,
                courses: coursesWithEnrollment,
                count: coursesWithEnrollment.length
            });
        }
        
        res.json({
            success: true,
            courses: courses,
            count: courses.length
        });
        
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses',
            message: error.message
        });
    }
});

// =====================================================
// GET SINGLE COURSE BY ID
// =====================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);
        
        if (isNaN(courseId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid course ID'
            });
        }
        
        // Get user from token if provided
        const authHeader = req.headers.authorization;
        let userId = null;
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const user = await verifyUser(token);
            if (user) userId = user.id;
        }
        
        // Fetch course
        const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        
        if (error || !course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }
        
        // Parse modules if stored as JSON
        let modulesList = course.modules;
        if (typeof modulesList === 'string') {
            try {
                modulesList = JSON.parse(modulesList);
            } catch(e) {
                modulesList = [];
            }
        }
        
        course.modules_list = modulesList || [];
        course.total_modules = course.modules_list.length;
        
        // Get enrollment status if user is logged in
        if (userId) {
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id, progress, status, enrolled_at')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .maybeSingle();
            
            course.is_enrolled = !!enrollment;
            course.enrollment_progress = enrollment?.progress || 0;
            course.enrollment_status = enrollment?.status || null;
            course.enrolled_at = enrollment?.enrolled_at || null;
        } else {
            course.is_enrolled = false;
        }
        
        res.json({
            success: true,
            course: course
        });
        
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course',
            message: error.message
        });
    }
});

// =====================================================
// GET COURSE MODULES (For enrolled users)
// =====================================================
router.get('/:courseId/modules', async (req, res) => {
    try {
        const { courseId } = req.params;
        const id = parseInt(courseId);
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid course ID'
            });
        }
        
        // Verify user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization required'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const user = await verifyUser(token);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        
        // Check if user is enrolled
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id, progress, status')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .maybeSingle();
        
        if (enrollmentError || !enrollment) {
            return res.status(403).json({
                success: false,
                error: 'You are not enrolled in this course'
            });
        }
        
        // Get course modules
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('name, modules, units')
            .eq('id', id)
            .single();
        
        if (courseError) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }
        
        // Parse modules
        let modulesList = course.modules;
        if (typeof modulesList === 'string') {
            try {
                modulesList = JSON.parse(modulesList);
            } catch(e) {
                modulesList = [];
            }
        }
        
        // Create module structure with progress
        const modulesWithProgress = (modulesList || []).map((module, index) => ({
            id: index + 1,
            name: module,
            order: index + 1,
            is_locked: index > (enrollment.progress || 0),
            is_completed: index < (enrollment.progress || 0),
            progress_status: index < (enrollment.progress || 0) ? 'completed' : 
                           index === (enrollment.progress || 0) ? 'in_progress' : 'locked'
        }));
        
        res.json({
            success: true,
            course_name: course.name,
            enrollment: {
                id: enrollment.id,
                progress: enrollment.progress,
                status: enrollment.status
            },
            modules: modulesWithProgress,
            total_modules: modulesWithProgress.length
        });
        
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course modules',
            message: error.message
        });
    }
});

// =====================================================
// GET COURSE STATISTICS
// =====================================================
router.get('/:courseId/stats', async (req, res) => {
    try {
        const { courseId } = req.params;
        const id = parseInt(courseId);
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid course ID'
            });
        }
        
        // Get total enrollments count
        const { count: totalEnrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', id);
        
        // Get completed count
        const { count: completedCount, error: completeError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', id)
            .eq('status', 'completed');
        
        res.json({
            success: true,
            statistics: {
                total_enrollments: totalEnrollments || 0,
                completed_count: completedCount || 0,
                completion_rate: totalEnrollments ? Math.round((completedCount || 0) / totalEnrollments * 100) : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course statistics'
        });
    }
});

export default router;
