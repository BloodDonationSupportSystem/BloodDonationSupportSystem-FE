import apiClient from './apiConfig';

// Import all service modules
import * as authService from './authService';
import * as donorProfileService from './donorProfileService';
import * as donationEventService from './donationEventService';
import * as notificationsService from './notificationsService';
import * as bloodGroupsService from './bloodGroupsService';
import * as documentsService from './documentsService';
import * as blogService from './blogService';

// Export the API client
export { apiClient };

// Export all services
export {
  authService,
  donorProfileService,
  donationEventService,
  notificationsService,
  bloodGroupsService,
  documentsService,
  blogService
};

// Re-export types from services
export type {
  // Auth types
  User, 
  LoginRequest, 
  RegisterRequest,
  AuthResponse,
  LoginResponse,
  RegisterResponse
} from './authService';

export type {
  // Donor profile types
  DonorProfile,
  DonorProfileRequest,
  DonorProfileUpdateRequest,
  ApiResponse
} from './donorProfileService';

export type {
  // Donation event types
  DonationEvent,
  DonationEventsParams,
  DonationEventsResponse
} from './donationEventService';

export type {
  // Notification types
  Notification,
  NotificationsParams,
  NotificationsResponse
} from './notificationsService';

export type {
  // Blood group types
  BloodGroup,
  BloodGroupsResponse
} from './bloodGroupsService';

export type {
  // Document types
  Document,
  DocumentsResponse
} from './documentsService';

export type {
  // Blog types
  BlogPost,
  PaginatedBlogPostsResponse
} from './blogService'; 