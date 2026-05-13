// frontend/src/routes/index.js

// Main export file for all route-related modules
export { default as AppRoutes } from './AppRoutes';
export { default as PrivateRoute } from './PrivateRoute';
export { default as RoleBasedRoute, useRoleCheck } from './RoleBasedRoute';
export { ROLES, ROLE_GROUPS, ROUTES } from './routeConfig';
export * as routeComponents from './routeComponents';
export { default as routeGroups } from './routeGroups';
export { default as lazyWithFallback } from './lazyWithFallback';

// Re-export commonly used items for easier imports
export { default as ComingSoon } from '../components/ComingSoon';