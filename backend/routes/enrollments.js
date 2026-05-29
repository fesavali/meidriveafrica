// routes/enrollments.js
// REAL PRODUCTION - MEI DRIVE AFRICA

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase directly (no external config file)
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://qpqkmmkrzxlhcpccefjn.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcWttbWtyenhsaGNwY2NlZmpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUyNTQ3MiwiZXhwIjoyMDk1MTAxNDcyfQ.8xHkQ3W5jZR2gZmDvVXq7jKyB5tQnC2ySmY9aBcfVpA'
);

// Helper: Generate enrollment number
function generateEnrollmentNumber() {
    return `ENR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// =====================================================
// GET USER'S ENROLLMENTS
// =====================================================
router.get('/my-enrollments', async (req, res) => {
    try {
        // Get user ID from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization required'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        
        const userId = user.id;
        
        // Get user's enrollments with course details
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                id,
                course_id,
                payment_status,
                payment_method,
                mpesa_code,
                enrolled_at,
                progress,
                status,
                courses:course_id (
                    id,
                    name,
                    price,
                    icon,
                    description,
                    duration,
                    units
                )
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            enrollments: data || [],
            count: data?.length || 0
        });
        
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enrollments',
            message: error.message
        });
    }
});

// =====================================================
// GET SINGLE ENROLLMENT DETAILS
// =====================================================
router.get('/:enrollmentId', async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        
        // Verify user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Authorization required' });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        // Get enrollment
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                courses:course_id (*)
            `)
            .eq('id', enrollmentId)
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Enrollment not found'
                });
            }
            throw error;
        }
        
        res.json({
            success: true,
            enrollment: data
        });
        
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch enrollment details'
        });
    }
});

// =====================================================
// ENROLL IN COURSE (Called after successful payment)
// =====================================================
router.post('/', async (req, res) => {
    try {
        const { course_id, mpesa_code, amount } = req.body;
        
        // Verify user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization required'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        
        const userId = user.id;
        
        // Validate required fields
        if (!course_id) {
            return res.status(400).json({
                success: false,
                error: 'Course ID is required'
            });
        }
        
        // Check if already enrolled
        const { data: existing, error: checkError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', course_id)
            .maybeSingle();
        
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Already enrolled in this course'
            });
        }
        
        // Get course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('name, price')
            .eq('id', course_id)
            .single();
        
        if (courseError) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }
        
        // Create enrollment
        const enrollmentNumber = generateEnrollmentNumber();
        const { data, error } = await supabase
            .from('enrollments')
            .insert({
                user_id: userId,
                course_id: course_id,
                payment_status: 'completed',
                payment_method: 'mpesa',
                mpesa_code: mpesa_code || `MPESA-${Date.now()}`,
                enrolled_at: new Date().toISOString(),
                progress: 0,
                status: 'active',
                enrollment_number: enrollmentNumber
            })
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Successfully enrolled in course',
            enrollment: {
                id: data.id,
                course_id: data.course_id,
                course_name: course.name,
                enrollment_number: data.enrollment_number,
                enrolled_at: data.enrolled_at,
                payment_status: data.payment_status
            }
        });
        
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create enrollment',
            message: error.message
        });
    }
});

// =====================================================
// CHECK ENROLLMENT STATUS
// =====================================================
router.get('/check/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Verify user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization required'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        
        // Check enrollment
        const { data, error } = await supabase
            .from('enrollments')
            .select('id, status, enrolled_at, progress')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (error) throw error;
        
        res.json({
            success: true,
            isEnrolled: !!data,
            enrollment: data || null
        });
        
    } catch (error) {
        console.error('Error checking enrollment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check enrollment status'
        });
    }
});

// =====================================================
// UPDATE PROGRESS
// =====================================================
router.put('/:enrollmentId/progress', async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { progress } = req.body;
        
        // Verify user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Authorization required' });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        // Verify enrollment belongs to user
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('id', enrollmentId)
            .eq('user_id', user.id)
            .single();
        
        if (enrollmentError) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized - Enrollment not found'
            });
        }
        
        // Update progress
        const { data, error } = await supabase
            .from('enrollments')
            .update({
                progress: progress,
                last_accessed: new Date().toISOString(),
                status: progress === 100 ? 'completed' : 'active',
                completed_at: progress === 100 ? new Date().toISOString() : null
            })
            .eq('id', enrollmentId)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: progress === 100 ? 'Course completed!' : 'Progress updated',
            progress: data.progress,
            status: data.status
        });
        
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update progress'
        });
    }
});

export default router;
