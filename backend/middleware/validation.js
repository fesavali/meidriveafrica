// middleware/validation.js
// REAL PRODUCTION - MEI DRIVE AFRICA
// Complete validation middleware for all endpoints

import { body, param, query, validationResult } from 'express-validator';

// =====================================================
// HANDLE VALIDATION ERRORS
// =====================================================
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            })),
            message: 'Validation failed. Please check your input.'
        });
    }
    next();
};

// =====================================================
// PHONE NUMBER VALIDATION (Kenyan M-Pesa - Production)
// =====================================================
export const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    // Kenyan phone formats: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX
    const phoneRegex = /^(?:07|01|\+?254)[0-9]{8}$/;
    const isValid = phoneRegex.test(phone);
    
    if (!isValid) {
        console.log(`❌ Invalid phone number format: ${phone}`);
    }
    
    return isValid;
};

// Format phone number for M-Pesa (254XXXXXXXXX)
export const formatPhoneForMpesa = (phone) => {
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    } else if (cleaned.length === 9) {
        cleaned = '254' + cleaned;
    }
    
    if (!cleaned.startsWith('254') || cleaned.length !== 12) {
        throw new Error('Invalid phone number format after formatting');
    }
    
    return cleaned;
};

// =====================================================
// COURSE VALIDATION RULES
// =====================================================
export const validateCourse = [
    body('name')
        .notEmpty().withMessage('Course name is required')
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Course name must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('price')
        .isFloat({ min: 49, max: 500000 }).withMessage('Price must be between 49 and 500,000 KES'),
    
    body('icon')
        .optional()
        .trim()
        .matches(/^fa-[a-z-]+$/).withMessage('Invalid icon format. Use Font Awesome class (e.g., fa-car)'),
    
    body('duration')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Duration cannot exceed 50 characters'),
    
    body('lessons_count')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Lessons count must be between 1 and 100')
        .toInt(),
    
    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code (e.g., #F39C12)'),
    
    handleValidationErrors
];

// =====================================================
// COURSE ID PARAM VALIDATION
// =====================================================
export const validateCourseId = [
    param('id')
        .isInt({ min: 1, max: 8 }).withMessage('Course ID must be between 1 and 8')
        .toInt(),
    handleValidationErrors
];

// =====================================================
// ENROLLMENT VALIDATION
// =====================================================
export const validateEnrollment = [
    body('course_id')
        .isInt({ min: 1, max: 8 }).withMessage('Valid course ID is required (1-8)')
        .toInt(),
    
    body('mpesa_code')
        .optional()
        .trim()
        .isLength({ min: 10, max: 50 }).withMessage('Invalid M-Pesa receipt code'),
    
    body('amount_paid')
        .optional()
        .isFloat({ min: 0 }).withMessage('Amount must be 0 or positive'),
    
    handleValidationErrors
];

// =====================================================
// PAYMENT VALIDATION (M-PESA - PRODUCTION)
// =====================================================
export const validatePayment = [
    body('phoneNumber')
        .notEmpty().withMessage('Phone number is required')
        .custom(value => {
            if (!validatePhoneNumber(value)) {
                throw new Error('Invalid Kenyan phone number. Use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX');
            }
            return true;
        }),
    
    body('amount')
        .isFloat({ min: 49, max: 500000 }).withMessage(`Amount must be between 49 and 500,000 KES`)
        .toFloat(),
    
    body('courseId')
        .isInt({ min: 1, max: 8 }).withMessage('Course ID must be between 1 and 8')
        .toInt(),
    
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isUUID().withMessage('Invalid user ID format'),
    
    body('email')
        .optional()
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail(),
    
    body('courseName')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Course name too long'),
    
    handleValidationErrors
];

// =====================================================
// USER VALIDATION (REGISTRATION)
// =====================================================
export const validateUser = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
    
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Full name can only contain letters, spaces, apostrophes, and hyphens'),
    
    body('phone')
        .optional()
        .custom(value => {
            if (value && !validatePhoneNumber(value)) {
                throw new Error('Invalid Kenyan phone number format');
            }
            return true;
        }),
    
    handleValidationErrors
];

// =====================================================
// LOGIN VALIDATION
// =====================================================
export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 1 }).withMessage('Password cannot be empty'),
    
    handleValidationErrors
];

// =====================================================
// PAGINATION VALIDATION
// =====================================================
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt()
        .default(1),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt()
        .default(20),
    
    query('sort')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Sort must be asc or desc')
        .default('desc'),
    
    handleValidationErrors
];

// =====================================================
// ADMIN USER ROLE VALIDATION
// =====================================================
export const validateUserRole = [
    body('is_admin')
        .isBoolean().withMessage('is_admin must be true or false')
        .toBoolean(),
    
    handleValidationErrors
];

// =====================================================
// M-PESA CALLBACK VALIDATION
// =====================================================
export const validateMpesaCallback = [
    body('Body.stkCallback.CheckoutRequestID')
        .notEmpty().withMessage('CheckoutRequestID is required'),
    
    body('Body.stkCallback.ResultCode')
        .notEmpty().withMessage('ResultCode is required'),
    
    handleValidationErrors
];

// =====================================================
// CHECKOUT REQUEST ID VALIDATION
// =====================================================
export const validateCheckoutRequestId = [
    body('checkoutRequestID')
        .notEmpty().withMessage('CheckoutRequestID is required')
        .isLength({ min: 10, max: 50 }).withMessage('Invalid CheckoutRequestID format'),
    
    handleValidationErrors
];

// =====================================================
// PROGRESS UPDATE VALIDATION
// =====================================================
export const validateProgress = [
    param('enrollmentId')
        .isInt({ min: 1 }).withMessage('Valid enrollment ID is required')
        .toInt(),
    
    body('progress')
        .isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
        .toInt(),
    
    handleValidationErrors
];

// =====================================================
// PASSWORD RESET VALIDATION
// =====================================================
export const validatePasswordReset = [
    body('token')
        .notEmpty().withMessage('Reset token is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    
    handleValidationErrors
];

// =====================================================
// FORGOT PASSWORD VALIDATION
// =====================================================
export const validateForgotPassword = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail(),
    
    handleValidationErrors
];

// =====================================================
// CONTACT FORM VALIDATION
// =====================================================
export const validateContactForm = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail(),
    
    body('message')
        .notEmpty().withMessage('Message is required')
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
    
    body('phone')
        .optional()
        .custom(value => {
            if (value && !validatePhoneNumber(value)) {
                throw new Error('Invalid Kenyan phone number format');
            }
            return true;
        }),
    
    handleValidationErrors
];

// =====================================================
// UNIT/LESSON VALIDATION
// =====================================================
export const validateUnit = [
    body('course_id')
        .isInt({ min: 1, max: 8 }).withMessage('Course ID must be between 1 and 8')
        .toInt(),
    
    body('unit_number')
        .isInt({ min: 1 }).withMessage('Unit number must be a positive integer')
        .toInt(),
    
    body('title')
        .notEmpty().withMessage('Unit title is required')
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Unit title must be between 3 and 200 characters'),
    
    body('content')
        .optional()
        .trim(),
    
    body('estimated_minutes')
        .optional()
        .isInt({ min: 5, max: 180 }).withMessage('Estimated minutes must be between 5 and 180')
        .toInt(),
    
    handleValidationErrors
];

// =====================================================
// QUIZ QUESTION VALIDATION
// =====================================================
export const validateQuizQuestion = [
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Road Signs', 'Highway Code', 'Defensive Driving', 'Traffic Rules', 'Emergency', 'Motorcycle', 'PSV', 'General'])
        .withMessage('Invalid category'),
    
    body('question')
        .notEmpty().withMessage('Question is required')
        .trim()
        .isLength({ min: 5, max: 500 }).withMessage('Question must be between 5 and 500 characters'),
    
    body('option_a')
        .notEmpty().withMessage('Option A is required')
        .trim(),
    
    body('option_b')
        .notEmpty().withMessage('Option B is required')
        .trim(),
    
    body('option_c')
        .notEmpty().withMessage('Option C is required')
        .trim(),
    
    body('option_d')
        .optional()
        .trim(),
    
    body('correct_option')
        .isInt({ min: 0, max: 3 }).withMessage('Correct option must be 0, 1, 2, or 3')
        .toInt(),
    
    body('explanation')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Explanation cannot exceed 500 characters'),
    
    handleValidationErrors
];

// =====================================================
// EXPORT ALL VALIDATION RULES
// =====================================================
export default {
    handleValidationErrors,
    validateCourse,
    validateCourseId,
    validateEnrollment,
    validatePayment,
    validateUser,
    validateLogin,
    validatePagination,
    validateUserRole,
    validateMpesaCallback,
    validateCheckoutRequestId,
    validateProgress,
    validatePasswordReset,
    validateForgotPassword,
    validateContactForm,
    validateUnit,
    validateQuizQuestion,
    validatePhoneNumber,
    formatPhoneForMpesa
};
