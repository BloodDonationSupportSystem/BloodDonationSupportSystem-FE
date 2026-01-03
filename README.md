# 🩸 BDSS - Frontend Application

> Next.js-based frontend for Blood Donation Support System

## 📋 Overview

Modern, responsive web application built with Next.js 15 and React 19, providing comprehensive interfaces for donors, staff, and administrators to manage the complete blood donation lifecycle.

## 🛠️ Technology Stack

```
Framework:         Next.js 15.3.4 (App Router)
Language:          TypeScript 5.0+
UI Library:        Ant Design 5.26.1
Styling:           Tailwind CSS 3.x + CSS Modules
State Management:  Redux Toolkit + React Query (TanStack Query)
HTTP Client:       Axios
Real-time:         SignalR (@microsoft/signalr)
Maps:              Leaflet + React-Leaflet + Mapbox GL
Charts:            Chart.js + React-Chartjs-2
Forms:             React Hook Form
Rich Text:         React Quill
Date Handling:     Day.js
```

## 🏗️ Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication Group
│   │   ├── login/
│   │   └── register/
│   ├── admin/                        # Admin Dashboard Routes
│   │   ├── dashboard/
│   │   ├── users/                    # User Management
│   │   ├── staffs/                   # Staff Management
│   │   ├── locations/                # Location Management
│   │   ├── documents/                # Document Management
│   │   └── blog/                     # Blog Post Management
│   ├── staff/                        # Staff Portal Routes
│   │   ├── dashboard/
│   │   ├── donation-events/          # Event Management
│   │   ├── donation-workflow/        # Workflow Processing
│   │   │   └── [id]/                 # Dynamic Route for Event
│   │   ├── inventory/                # Blood Inventory
│   │   ├── donors/                   # Donor Profiles
│   │   ├── appointments/             # Appointment Management
│   │   ├── blood-request/            # Blood Requests
│   │   └── capacity/                 # Location Capacity
│   ├── member/                       # Member/Donor Portal Routes
│   │   ├── dashboard/
│   │   ├── profile/                  # User Profile
│   │   ├── appointments/             # View Appointments
│   │   ├── donation-history/         # Donation Records
│   │   ├── achievements/             # Badges & Achievements
│   │   ├── availability/             # Availability Calendar
│   │   ├── blood-registration/       # Blood Group Registration
│   │   ├── donate-blood/             # Donation Events
│   │   ├── emergency-request/        # Emergency Blood Requests
│   │   ├── nearby-search/            # Find Nearby Centers
│   │   ├── notifications/            # Notification Center
│   │   ├── my-requests/              # User's Blood Requests
│   │   ├── reports/                  # Personal Reports
│   │   └── blood-info/               # Blood Information
│   ├── blog/                         # Public Blog
│   │   └── [id]/                     # Blog Post Detail
│   ├── about/                        # About Page
│   ├── contact/                      # Contact Page
│   ├── blood-compatibility/          # Compatibility Checker
│   ├── blood-info/                   # Blood Information
│   ├── donate-blood/                 # Public Donation Events
│   ├── request-blood/                # Public Blood Requests
│   ├── profile/                      # Public Profile View
│   ├── profile-creation/             # Profile Setup
│   └── layout.tsx                    # Root Layout
│
├── components/                       # Reusable Components
│   ├── Layout/
│   │   ├── Header.tsx                # Main Header
│   │   ├── Footer.tsx                # Main Footer
│   │   ├── AdminLayout.tsx           # Admin Dashboard Layout
│   │   ├── StaffLayout.tsx           # Staff Portal Layout
│   │   ├── MemberLayout.tsx          # Member Portal Layout
│   │   ├── AppLayout.tsx             # General App Layout
│   │   ├── AdminSidebar.tsx          # Admin Navigation
│   │   ├── StaffSidebar.tsx          # Staff Navigation
│   │   └── MemberSidebar.tsx         # Member Navigation
│   ├── BlogPostList.tsx              # Blog Post Cards
│   ├── DonationEventCard.tsx         # Event Display Card
│   ├── MapComponent.tsx              # Interactive Map
│   ├── NotificationBell.tsx          # Real-time Notifications
│   ├── ProtectedRoute.tsx            # Route Protection HOC
│   └── ...                           # Feature-specific Components
│
├── services/                         # API Integration
│   └── api/
│       ├── apiConfig.ts              # Axios Configuration
│       ├── authService.ts            # Authentication APIs
│       ├── donationService.ts        # Donation Event APIs
│       ├── appointmentService.ts     # Appointment APIs
│       ├── inventoryService.ts       # Inventory APIs
│       ├── blogService.ts            # Blog APIs
│       ├── locationService.ts        # Location APIs
│       ├── mapService.ts             # Map Integration
│       ├── notificationService.ts    # Notification APIs
│       └── userService.ts            # User Management APIs
│
├── store/                            # Redux State Management
│   ├── slices/
│   │   ├── authSlice.ts              # Authentication State
│   │   └── notificationSlice.ts      # Notification State
│   └── store.ts                      # Store Configuration
│
├── hooks/                            # Custom React Hooks
│   ├── useAuth.ts                    # Authentication Hook
│   ├── useDonation.ts                # Donation Data Hook
│   ├── useBlogPosts.ts               # Blog Posts Hook
│   ├── useNotifications.ts           # Notifications Hook
│   └── ...                           # Feature-specific Hooks
│
├── types/                            # TypeScript Type Definitions
│   ├── auth.ts                       # Auth Types
│   ├── donation.ts                   # Donation Types
│   ├── blog.ts                       # Blog Types
│   ├── user.ts                       # User Types
│   ├── notification.ts               # Notification Types
│   └── ...                           # Domain Model Types
│
├── utils/                            # Utility Functions
│   ├── formatters.ts                 # Data Formatters
│   ├── validators.ts                 # Input Validators
│   └── constants.ts                  # App Constants
│
├── config/                           # Configuration
│   └── constants.ts                  # API URLs & Constants
│
├── context/                          # React Context
│   └── AuthContext.tsx               # Auth Context Provider
│
└── styles/                           # Global Styles
    └── globals.css                   # Tailwind + Custom CSS
```

## ✨ Key Features

### 🎨 User Interface
- **Responsive Design** - Mobile-first approach, works on all devices
- **Modern UI** - Ant Design components with custom Tailwind styling
- **Dark Mode Ready** - Theme customization support
- **Accessibility** - WCAG 2.1 AA compliant

### 🔐 Authentication & Authorization
- **JWT Token Management** - Secure authentication with refresh tokens
- **Role-based Access** - Admin, Staff, and Member roles
- **Protected Routes** - Route guards based on authentication and roles
- **Account Security** - Lockout protection, secure password policies

### 📊 Admin Features
- **User Management** - CRUD operations for users and staff
- **Location Management** - Manage donation centers and facilities
- **Content Management** - Blog posts, documents, and educational content
- **Analytics Dashboard** - System-wide statistics and reports

### 🏥 Staff Features
- **Event Management** - Create and manage donation campaigns
- **Workflow Processing** - Step-by-step donation workflow tracking
- **Inventory Control** - Real-time blood stock monitoring
- **Donor Management** - View and manage donor profiles
- **Appointment Handling** - Process and schedule appointments

### 👥 Member/Donor Features
- **Personal Dashboard** - Overview of donations, appointments, achievements
- **Appointment Booking** - Browse and register for donation events
- **Donation History** - Track all past donations with details
- **Achievement System** - Badges and milestones for donations
- **Emergency Requests** - Submit urgent blood requirement requests
- **Nearby Search** - Find donation centers using interactive maps
- **Notifications** - Real-time alerts for eligibility and events

### 🗺️ Map Integration
- **Interactive Maps** - Leaflet and Mapbox GL integration
- **Location Search** - Autocomplete and geocoding
- **Directions** - Get directions to donation centers
- **Custom Markers** - Visual indicators for facilities

### 🔔 Real-time Features
- **SignalR Integration** - WebSocket-based real-time updates
- **Live Notifications** - Instant alerts for important events
- **Inventory Updates** - Real-time blood stock changes
- **Appointment Confirmations** - Immediate booking feedback

### 📈 Data Visualization
- **Charts & Graphs** - Chart.js for donation trends and statistics
- **Dashboard Analytics** - Visual representation of key metrics
- **Custom Reports** - Exportable data views

## 🎯 State Management

### Redux Toolkit
- **Global State** - Authentication, user data, notifications
- **Slices** - Modular state management
- **Middleware** - Custom middleware for API calls

### React Query (TanStack Query)
- **Data Fetching** - Automatic caching and refetching
- **Mutations** - Optimistic updates and error handling
- **Background Sync** - Keep data fresh

## 🌐 API Integration

### Axios Configuration
- **Base URL** - Environment-based API endpoint
- **Interceptors** - Automatic token injection and error handling
- **Request/Response Transformation** - Consistent data formatting

### Service Layer
- **Modular Services** - Separate services for each domain
- **Type Safety** - Full TypeScript support
- **Error Handling** - Centralized error management

## 📱 Responsive Design

- **Breakpoints** - Mobile, Tablet, Desktop, Large Desktop
- **Touch Optimized** - Mobile-friendly interactions
- **Progressive Enhancement** - Works on all modern browsers

## 🔒 Security Features

- **XSS Protection** - DOMPurify for sanitizing HTML content
- **CSRF Protection** - Token-based CSRF prevention
- **Secure Storage** - Encrypted local storage for sensitive data
- **Input Validation** - Client-side validation with React Hook Form

## 🚀 Performance Optimizations

- **Code Splitting** - Dynamic imports for route-based splitting
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Defer loading of non-critical components
- **Caching Strategy** - React Query for efficient data caching
- **Turbopack** - Fast bundling with Turbopack in development

## 📦 Build & Deployment

- **Production Build** - Optimized bundle for deployment
- **Static Generation** - Pre-rendered pages where possible
- **Server-Side Rendering** - Dynamic content rendering
- **Vercel Ready** - Optimized for Vercel deployment

## 🧪 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5222
```

See `.env.example` for all available variables.

## 📝 Notes

- Uses Next.js 15 App Router (not Pages Router)
- Requires Node.js 20.x or higher
- Compatible with modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
