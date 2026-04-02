/**
 * Admin Configuration
 * 
 * Only the email listed here will have access to admin features
 * like reviewing, accepting, and rejecting treks.
 * 
 * ⚠️ IMPORTANT: Replace the email below with YOUR admin email.
 */

// The admin email — ONLY this user can access admin features
export const ADMIN_EMAIL = 'darnalsaurav123@gmail.com';

// Trek approval status constants
export const TREK_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
};

// Check if the current user is admin
export const isAdminUser = (user) => {
    if (!user || !user.email) return false;
    return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
