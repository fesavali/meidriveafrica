// src/routeGuard.js
import { auth } from './auth.js';

export function requireAuth() {
    if (!auth.isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/';
        return false;
    }
    return true;
}

export function requireAdmin() {
    if (!auth.isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/';
        return false;
    }
    
    if (!auth.isAdmin()) {
        window.location.href = '/dashboard.html';
        return false;
    }
    
    return true;
}

export function redirectIfLoggedIn() {
    if (auth.isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return false;
    }
    return true;
}
