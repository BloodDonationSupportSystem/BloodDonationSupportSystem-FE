import { User } from '@/services/api/authService';

// Define role-based route access
export const ROLE_BASED_ROUTES = {
    Admin: ['/admin', '/admin/dashboard', '/admin/users', '/admin/locations', '/admin/reports', '/admin/settings'],
    Staff: ['/staff', '/staff/dashboard', '/staff/donations', '/staff/requests', '/staff/donors'],
    Member: [
        '/member',
        '/member/dashboard',
        '/member/profile',
        '/member/appointments',
        '/member/donate-blood',
        '/member/my-requests',
        '/member/notifications',
        '/profile-creation',
        '/donor',
        '/donor/dashboard',
        '/donor/profile',
        '/donor/history',
        '/donor/appointments',
        '/user',
        '/user/dashboard',
        '/user/profile',
        '/user/requests'
    ]
};

// Define default landing pages for each role
export const DEFAULT_ROLE_LANDING_PAGES = {
    Admin: '/admin/dashboard',
    Staff: '/staff/dashboard',
    Member: '/member/dashboard',
    default: '/'
};

// Define public routes that don't require authentication
export const PUBLIC_ROUTES = [
    '/',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/forgot-password',
    '/donate-blood',
    '/request-blood',
    '/blood-info',
    '/blood-compatibility',
    '/blog'
];

// Check if a path is public
export const isPublicRoute = (path: string): boolean => {
    return PUBLIC_ROUTES.some(route =>
        path === route ||
        (route !== '/' && path.startsWith(route + '/'))
    );
};

// Check if user has access to the current path
export const hasAccessToRoute = (user: User | null, path: string): boolean => {
    // Allow access to public routes for all users (even if not logged in)
    if (isPublicRoute(path)) return true;

    // If not a public route and no user, deny access
    if (!user) return false;

    // Map Donor and User roles to Member for access control
    let roleName = user.roleName;
    if (roleName === 'Donor' || roleName === 'User') {
        roleName = 'Member';
    }

    // For Admin and Staff, check against their specific routes
    if (roleName === 'Admin') {
        return ROLE_BASED_ROUTES.Admin.some(route => path.startsWith(route));
    }

    if (roleName === 'Staff') {
        return ROLE_BASED_ROUTES.Staff.some(route => path.startsWith(route));
    }

    // For Members, allow access to all routes except Admin and Staff routes
    if (roleName === 'Member') {
        // Deny access to admin and staff routes
        if (path.startsWith('/admin') || path.startsWith('/staff')) {
            return false;
        }
        // Allow access to all other routes
        return true;
    }

    // For any other roles (should not happen), deny access
    return false;
};

// Get the appropriate redirect path for a user
export const getRedirectPath = (user: User | null): string => {
    if (!user) return '/login';

    // Map Donor and User roles to Member for redirection
    let roleName = user.roleName;
    if (roleName === 'Donor' || roleName === 'User') {
        roleName = 'Member';
    }

    return DEFAULT_ROLE_LANDING_PAGES[roleName as keyof typeof DEFAULT_ROLE_LANDING_PAGES] ||
        DEFAULT_ROLE_LANDING_PAGES.default;
}; 