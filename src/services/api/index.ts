import apiClient from './apiConfig';

// Import all service modules
import * as authService from './authService';
import * as donorProfileService from './donorProfileService';
import * as donationEventService from './donationEventService';
import * as notificationsService from './notificationsService';
import * as bloodGroupsService from './bloodGroupsService';
import * as documentsService from './documentsService';
import * as blogService from './blogService';
import * as donationAppointmentService from './donationAppointmentService';
import * as locationService from './locationService';
import * as componentTypeService from './componentTypeService';

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
  blogService,
  donationAppointmentService,
  locationService,
  componentTypeService
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
  ApiResponse,
  EligibilityResponse
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

export type {
  // Location types
  Location,
  LocationsResponse,
  OperatingHour,
  Capacity
} from './locationService';

export type {
  // Component type
  ComponentType,
  ComponentTypesResponse
} from './componentTypeService';

export type {
  // Donation appointment types
  AvailableTimeSlot,
  AvailableTimeSlotResponse,
  DonationAppointmentRequest,
  DonationAppointmentRequestResponse,
  PendingAppointment
} from './donationAppointmentService'; 