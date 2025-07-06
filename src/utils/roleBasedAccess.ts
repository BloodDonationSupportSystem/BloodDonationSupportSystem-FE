import { User } from '@/services/api/authService';

// Define role-based route access
export const ROLE_BASED_ROUTES = {
    Admin: ['/admin', '/admin/dashboard', '/admin/users', '/admin/locations', '/admin/reports', '/admin/settings'],
    Staff: ['/staff', '/staff/dashboard', '/staff/donations', '/staff/requests', '/staff/donors'],
    Donor: ['/donor', '/donor/dashboard', '/donor/profile', '/donor/history', '/donor/appointments', '/member', '/member/dashboard', '/member/profile', '/member/appointments', '/member/donate-blood', '/member/my-requests', '/member/notifications'],
    Member: ['/member', '/member/dashboard', '/member/profile', '/member/appointments', '/member/donate-blood', '/member/my-requests', '/member/notifications'],
    User: ['/user', '/user/dashboard', '/user/profile', '/user/requests']
};

// Define default landing pages for each role
export const DEFAULT_ROLE_LANDING_PAGES = {
    Admin: '/admin/dashboard',
    Staff: '/staff/dashboard',
    Donor: '/donor/dashboard',
    Member: '/member/dashboard',
    User: '/user/dashboard',
    default: '/'
};

// Check if user has access to the current path
export const hasAccessToRoute = (user: User | null, path: string): boolean => {
    if (!user) return false;

    // Allow access to public routes for all users
    const publicRoutes = ['/', '/about', '/contact', '/login', '/register', '/forgot-password'];
    if (publicRoutes.includes(path)) return true;

    // Get allowed routes for user's role
    const roleRoutes = ROLE_BASED_ROUTES[user.roleName as keyof typeof ROLE_BASED_ROUTES] || [];

    // For debugging
    console.log('User role:', user.roleName);
    console.log('Current path:', path);
    console.log('Allowed routes:', roleRoutes);
    console.log('Has access:', roleRoutes.some(route => path.startsWith(route)));

    // Check if the current path starts with any of the allowed routes
    return roleRoutes.some(route => path.startsWith(route));
};

// Get the appropriate redirect path for a user
export const getRedirectPath = (user: User | null): string => {
    if (!user) return '/login';

    return DEFAULT_ROLE_LANDING_PAGES[user.roleName as keyof typeof DEFAULT_ROLE_LANDING_PAGES] ||
        DEFAULT_ROLE_LANDING_PAGES.default;
}; 