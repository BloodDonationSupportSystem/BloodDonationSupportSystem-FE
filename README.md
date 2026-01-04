<div align="center">

# 🩸 BDSS Frontend

### Blood Donation Support System - Modern Web Application

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.26-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)](https://ant.design/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*A modern, responsive web application for blood donation management, featuring real-time updates, interactive maps, and comprehensive donor/staff portals.*

[Live Demo](#) • [Documentation](#) • [Report Bug](#-contributing) • [Request Feature](#-contributing)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [User Interfaces](#-user-interfaces)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About The Project

**BDSS Frontend** is a modern, enterprise-grade web application built with Next.js 15 and React 19, providing comprehensive interfaces for blood donation management. The platform serves three distinct user roles (Donors, Staff, and Administrators) with tailored experiences for each, featuring real-time notifications, interactive maps, and intuitive workflows.

### 🎓 Project Details
- **Development Period:** 4 months (5/2025 - 8/2025)
- **Team Size:** 1 Developer (Solo Project)
- **Framework:** Next.js 15 with App Router
- **Architecture:** Component-based Architecture with Server/Client Components
- **Lines of Code:** ~10,000+ (Frontend only)

### 💡 Problem Statement

Traditional blood donation web interfaces suffer from:
- Poor user experience and outdated designs
- Lack of real-time updates for donors and staff
- Limited mobile responsiveness
- Complex navigation and workflows
- No interactive features like maps or live tracking
- Inconsistent state management across pages

### ✅ Our Solution

BDSS Frontend provides a modern, user-friendly platform that:
- Delivers seamless user experience across all devices
- Implements real-time updates via SignalR WebSockets
- Features interactive maps for location discovery
- Offers intuitive role-based dashboards and workflows
- Utilizes modern state management with Redux and React Query
- Provides accessible, WCAG-compliant UI components

---

## ⭐ Key Features

### 🎨 User Experience
- **Responsive design** - Mobile-first approach, optimized for all screen sizes
- **Modern UI/UX** - Clean, intuitive interfaces with Ant Design components
- **Dark/Light mode** - Customizable theme preferences (planned)
- **Accessibility** - WCAG 2.1 compliant components
- **Loading states** - Skeleton screens and smooth transitions
- **Error handling** - User-friendly error messages and retry mechanisms

### 🔐 Authentication & Authorization
- **JWT-based authentication** - Secure token-based login system
- **Role-based routing** - Protected routes based on user roles
- **Persistent sessions** - Auto-refresh tokens for seamless experience
- **Password recovery** - Email-based password reset flow
- **Account registration** - Multi-step registration with validation

### 👥 Member (Donor) Portal
- **Personal dashboard** - Overview of donation history and stats
- **Appointment booking** - Browse and book donation events with calendar view
- **Donation history** - Complete timeline of past donations with badges
- **Eligibility tracker** - Visual countdown to next eligible donation date
- **Profile management** - Update personal and medical information
- **Nearby locations** - Interactive map to find closest donation centers
- **Real-time notifications** - Instant alerts for appointment status changes
- **Achievement system** - Badges and milestones for donation goals

### 🏥 Staff Portal
- **Staff dashboard** - Real-time metrics and pending tasks overview
- **Event management** - Create, edit, and manage donation events
- **Donation workflow** - Step-by-step process for conducting donations
  - Donor check-in and verification
  - Medical screening and questionnaire
  - Blood sample collection
  - Post-donation care and monitoring
- **Appointment management** - Approve/reject appointment requests
- **Inventory management** - Track blood stock levels and components
- **Donor profiles** - View complete donor histories and medical records
- **Blood requests** - Process urgent blood requests from hospitals
- **Capacity management** - Set and monitor daily donation limits

### 👨‍💼 Admin Portal
- **Admin dashboard** - Comprehensive system analytics and KPIs
- **User management** - CRUD operations for all user accounts
- **Staff management** - Create and manage staff accounts with permissions
- **Location management** - Add/edit donation centers with map integration
- **Content management** - Blog post creation with rich text editor
- **Document library** - Upload and manage policy documents
- **System settings** - Configure application-wide settings
- **Reports & analytics** - Generate custom reports and export data

### 🗺️ Interactive Maps
- **Leaflet integration** - Open-source mapping with OpenStreetMap
- **Location markers** - Visual display of all donation centers
- **Proximity search** - Find nearest locations based on user's position
- **Directions** - Get directions to selected donation center
- **Custom map styles** - Themed map appearance

### 🔔 Real-time Notifications
- **SignalR integration** - WebSocket-based real-time messaging
- **Notification center** - Centralized inbox for all notifications
- **Push notifications** - Instant alerts for critical updates
- **Notification badges** - Unread count indicators
- **Notification filters** - Sort by type and read status

### 📊 Data Visualization
- **Chart.js integration** - Interactive charts and graphs
- **Dashboard widgets** - Real-time statistics cards
- **Trend analysis** - Historical data visualization
- **Export functionality** - Download charts as images

### 📝 Forms & Validation
- **React Hook Form** - Performant form handling
- **Multi-step forms** - Wizard-style registration and workflows
- **Client-side validation** - Instant feedback on form inputs
- **Rich text editor** - React Quill for blog content creation

### 🚀 Performance
- **Next.js optimizations** - Automatic code splitting and lazy loading
- **Image optimization** - Next.js Image component for optimal loading
- **React Query caching** - Smart data caching and background refetching
- **Skeleton loaders** - Improved perceived performance
- **Debounced search** - Optimized search input handling

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.4 | React framework with App Router |
| React | 19 | UI library for building components |
| TypeScript | 5.0+ | Type-safe JavaScript |
| Node.js | 18+ | JavaScript runtime |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| Ant Design | 5.26.1 - Enterprise UI component library |
| Tailwind CSS | 3.x - Utility-first CSS framework |
| CSS Modules | Component-scoped styling |
| Ant Design Icons | Icon library |
| Sass/SCSS | CSS preprocessor (optional) |

### State Management
| Technology | Purpose |
|------------|---------|
| Redux Toolkit | Global state management |
| React Query (TanStack Query) | Server state management and caching |
| React Context | Component-level state sharing |
| React Hooks | Local component state |

### HTTP & Real-time
| Technology | Purpose |
|------------|---------|
| Axios | HTTP client for API requests |
| SignalR (@microsoft/signalr) | Real-time WebSocket communication |
| Axios Interceptors | Request/response transformation |

### Maps & Location
| Technology | Purpose |
|------------|---------|
| Leaflet | Interactive mapping library |
| React-Leaflet | React wrapper for Leaflet |
| Mapbox GL (optional) | Advanced map styling |
| OpenStreetMap | Map tile provider |
| Geolocation API | Browser geolocation |

### Data Visualization
| Technology | Purpose |
|------------|---------|
| Chart.js | Chart and graph library |
| React-Chartjs-2 | React wrapper for Chart.js |

### Forms & Validation
| Technology | Purpose |
|------------|---------|
| React Hook Form | Form state management |
| Zod | Schema validation |
| React Quill | Rich text WYSIWYG editor |

### Date & Time
| Technology | Purpose |
|------------|---------|
| Day.js | Date manipulation and formatting |
| Ant Design DatePicker | Date/time input components |

### Utilities
| Technology | Purpose |
|------------|---------|
| Lodash | JavaScript utility library |
| clsx / classnames | Conditional CSS class management |
| react-hot-toast | Toast notifications (optional) |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| TypeScript ESLint | TypeScript-specific linting |

### Deployment
| Platform | Purpose |
|----------|---------|
| Vercel | Production hosting and CI/CD |
| npm / yarn | Package management |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Browser / Client                               │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Next.js Application                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        App Router (app/)                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │   (auth)/    │  │   admin/     │  │   staff/    │   member/  │ │   │
│  │  │  • login     │  │  • dashboard │  │  • events   │  • profile │ │   │
│  │  │  • register  │  │  • users     │  │  • workflow │  • history │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Component Layer                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Layout     │  │   Feature    │  │     UI       │  │    Forms     │  │
│  │  Components  │  │  Components  │  │  Components  │  │  Components  │  │
│  │  • Header    │  │  • Dashboard │  │  • Cards     │  │  • Login     │  │
│  │  • Sidebar   │  │  • EventList │  │  • Tables    │  │  • Register  │  │
│  │  • Footer    │  │  • MapView   │  │  • Modals    │  │  • Profile   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      State Management Layer                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Redux Store                                                         │  │
│  │  • authSlice (user, token, role)                                     │  │
│  │  • notificationSlice (messages, unread count)                        │  │
│  │  • uiSlice (theme, sidebar state)                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  React Query (TanStack Query)                                        │  │
│  │  • Server state caching                                              │  │
│  │  • Background refetching                                             │  │
│  │  • Optimistic updates                                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Service Layer                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  API Services (services/api/)                                        │  │
│  │  • authService     - Login, register, token refresh                 │  │
│  │  • donationService - Events, appointments, donations                │  │
│  │  • userService     - Profile, users management                      │  │
│  │  • inventoryService - Blood inventory CRUD                          │  │
│  │  • locationService - Locations, capacity                            │  │
│  │  • notificationService - Notifications, read status                 │  │
│  │  • blogService     - Blog posts, content                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Axios HTTP Client                                                   │  │
│  │  • Request interceptors (add JWT token)                             │  │
│  │  • Response interceptors (handle errors, refresh token)             │  │
│  │  • Base URL configuration                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  SignalR Hub Connection                                              │  │
│  │  • Real-time notification hub                                        │  │
│  │  • Automatic reconnection                                            │  │
│  │  • Event handlers for push messages                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       External Services                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │   BDSS Backend API   │  │   OpenStreetMap      │  │   Cloudinary    │  │
│  │   (REST + SignalR)   │  │   (Map Tiles)        │  │   (Images)      │  │
│  └──────────────────────┘  └──────────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Root                          │
│  • Redux Provider                                            │
│  • React Query Provider                                      │
│  • SignalR Provider                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layout Components                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ AdminLayout  │  │ StaffLayout  │  │ MemberLayout │     │
│  │ • Header     │  │ • Header     │  │ • Header     │     │
│  │ • Sidebar    │  │ • Sidebar    │  │ • Navbar     │     │
│  │ • Content    │  │ • Content    │  │ • Content    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                           │
│  • Dashboard pages                                           │
│  • List pages (tables, cards)                                │
│  • Detail pages                                              │
│  • Form pages (create, edit)                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Components                          │
│  • EventCard, EventList, EventDetails                        │
│  • AppointmentCard, AppointmentList                          │
│  • MapView, LocationMarker                                   │
│  • NotificationBell, NotificationList                        │
│  • DonationHistory, DonationTimeline                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI Components                             │
│  • Button, Input, Select (Ant Design)                        │
│  • Card, Table, Modal                                        │
│  • Form, DatePicker, Upload                                  │
│  • Chart, Badge, Tag                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js 18+ or later
- npm or yarn package manager
- Git

# Recommended
- VS Code with ESLint and Prettier extensions
- React Developer Tools browser extension
- Redux DevTools browser extension
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BDSS.git
   cd BDSS/BloodDonationSupportSystem-FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=https://localhost:5222/api
   
   # SignalR Hub URL
   NEXT_PUBLIC_SIGNALR_URL=https://localhost:5222
   
   # Map Configuration
   NEXT_PUBLIC_MAP_API_KEY=your_mapbox_api_key_here
   NEXT_PUBLIC_MAP_STYLE=mapbox://styles/mapbox/streets-v11
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=BDSS
   NEXT_PUBLIC_APP_VERSION=1.0.0
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   NEXT_PUBLIC_ENABLE_DARK_MODE=false
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open Browser**
   
   Navigate to: `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Export static site (if applicable)
npm run export
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

---

## 📁 Project Structure

```
src/
├── app/                                # Next.js App Router
│   ├── (auth)/                         # Authentication Routes (Layout Group)
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   ├── register/
│   │   │   └── page.tsx                # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx                # Password recovery
│   │   └── layout.tsx                  # Auth layout (centered, no sidebar)
│   │
│   ├── admin/                          # Admin Portal Routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                # User list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # User details
│   │   │   └── create/
│   │   │       └── page.tsx            # Create user
│   │   ├── staffs/
│   │   │   └── page.tsx                # Staff management
│   │   ├── locations/
│   │   │   ├── page.tsx                # Location list
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Location details
│   │   ├── blog/
│   │   │   ├── page.tsx                # Blog post list
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # Create post
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Post details
│   │   │       └── edit/
│   │   │           └── page.tsx        # Edit post
│   │   ├── documents/
│   │   │   └── page.tsx                # Document library
│   │   └── layout.tsx                  # Admin layout (with sidebar)
│   │
│   ├── staff/                          # Staff Portal Routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Staff dashboard
│   │   ├── donation-events/
│   │   │   ├── page.tsx                # Event list
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # Create event
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Event details
│   │   │       └── edit/
│   │   │           └── page.tsx        # Edit event
│   │   ├── donation-workflow/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Workflow steps for event
│   │   ├── inventory/
│   │   │   ├── page.tsx                # Inventory list
│   │   │   └── statistics/
│   │   │       └── page.tsx            # Inventory stats
│   │   ├── donors/
│   │   │   ├── page.tsx                # Donor list
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Donor profile
│   │   ├── appointments/
│   │   │   └── page.tsx                # Appointment requests
│   │   ├── blood-request/
│   │   │   └── page.tsx                # Blood requests
│   │   ├── capacity/
│   │   │   └── page.tsx                # Capacity management
│   │   └── layout.tsx                  # Staff layout
│   │
│   ├── member/                         # Member/Donor Portal Routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Member dashboard
│   │   ├── appointments/
│   │   │   ├── page.tsx                # My appointments
│   │   │   └── book/
│   │   │       └── page.tsx            # Book appointment
│   │   ├── donation-history/
│   │   │   └── page.tsx                # Donation history
│   │   ├── profile/
│   │   │   └── page.tsx                # Profile settings
│   │   ├── nearby-search/
│   │   │   └── page.tsx                # Find locations (map)
│   │   └── layout.tsx                  # Member layout
│   │
│   ├── page.tsx                        # Homepage (public)
│   ├── layout.tsx                      # Root layout
│   ├── loading.tsx                     # Global loading state
│   ├── error.tsx                       # Global error boundary
│   └── not-found.tsx                   # 404 page
│
├── components/                         # Reusable Components
│   ├── Layout/
│   │   ├── Header.tsx                  # Main header
│   │   ├── Footer.tsx                  # Footer
│   │   ├── Sidebar.tsx                 # Navigation sidebar
│   │   ├── AdminLayout.tsx             # Admin layout wrapper
│   │   ├── StaffLayout.tsx             # Staff layout wrapper
│   │   └── MemberLayout.tsx            # Member layout wrapper
│   │
│   ├── Auth/
│   │   ├── LoginForm.tsx               # Login form component
│   │   ├── RegisterForm.tsx            # Registration form
│   │   └── ProtectedRoute.tsx          # Route guard component
│   │
│   ├── Donation/
│   │   ├── EventCard.tsx               # Event card display
│   │   ├── EventList.tsx               # Event list view
│   │   ├── EventDetails.tsx            # Event details
│   │   ├── AppointmentCard.tsx         # Appointment card
│   │   ├── DonationHistory.tsx         # History timeline
│   │   └── WorkflowSteps.tsx           # Workflow stepper
│   │
│   ├── Inventory/
│   │   ├── InventoryTable.tsx          # Inventory table
│   │   ├── StockChart.tsx              # Stock level chart
│   │   └── BloodTypeCard.tsx           # Blood type card
│   │
│   ├── Map/
│   │   ├── MapView.tsx                 # Map container
│   │   ├── LocationMarker.tsx          # Location marker
│   │   └── DirectionsPanel.tsx         # Directions sidebar
│   │
│   ├── Notification/
│   │   ├── NotificationBell.tsx        # Notification icon
│   │   ├── NotificationList.tsx        # Notification dropdown
│   │   └── NotificationItem.tsx        # Single notification
│   │
│   ├── Dashboard/
│   │   ├── StatCard.tsx                # Dashboard stat card
│   │   ├── RecentActivity.tsx          # Activity feed
│   │   └── QuickActions.tsx            # Action buttons
│   │
│   └── Common/
│       ├── Button.tsx                  # Custom button
│       ├── Card.tsx                    # Custom card
│       ├── Table.tsx                   # Custom table
│       └── Modal.tsx                   # Custom modal
│
├── services/                           # API Services
│   └── api/
│       ├── apiConfig.ts                # Axios configuration
│       ├── authService.ts              # Auth endpoints
│       ├── donationService.ts          # Donation endpoints
│       ├── userService.ts              # User endpoints
│       ├── inventoryService.ts         # Inventory endpoints
│       ├── locationService.ts          # Location endpoints
│       ├── notificationService.ts      # Notification endpoints
│       ├── blogService.ts              # Blog endpoints
│       └── signalrService.ts           # SignalR connection
│
├── store/                              # Redux Store
│   ├── slices/
│   │   ├── authSlice.ts                # Auth state slice
│   │   ├── notificationSlice.ts        # Notification state
│   │   └── uiSlice.ts                  # UI state (theme, sidebar)
│   ├── hooks.ts                        # Typed Redux hooks
│   └── store.ts                        # Store configuration
│
├── hooks/                              # Custom React Hooks
│   ├── useAuth.ts                      # Authentication hook
│   ├── useDonation.ts                  # Donation operations hook
│   ├── useNotifications.ts             # Real-time notifications
│   ├── useMap.ts                       # Map utilities hook
│   └── useDebounce.ts                  # Debounce hook
│
├── types/                              # TypeScript Types
│   ├── auth.ts                         # Auth-related types
│   ├── donation.ts                     # Donation types
│   ├── user.ts                         # User types
│   ├── inventory.ts                    # Inventory types
│   ├── notification.ts                 # Notification types
│   └── api.ts                          # API response types
│
├── utils/                              # Utility Functions
│   ├── formatters.ts                   # Date, number formatters
│   ├── validators.ts                   # Form validators
│   ├── constants.ts                    # App constants
│   ├── helpers.ts                      # Helper functions
│   └── storage.ts                      # LocalStorage helpers
│
├── styles/                             # Global Styles
│   ├── globals.css                     # Global CSS
│   ├── variables.css                   # CSS variables
│   └── antd-overrides.css              # Ant Design overrides
│
├── public/                             # Static Assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero-bg.jpg
│   │   └── icons/
│   ├── fonts/
│   └── favicon.ico
│
└── middleware.ts                       # Next.js Middleware (Auth, routing)
```

---

## 🖥️ User Interfaces

### Member Portal
- **Dashboard:** Personal statistics, upcoming appointments, donation eligibility status
- **Book Appointment:** Browse events, select date/time, confirm booking
- **Donation History:** Timeline view of past donations with certificates
- **Find Locations:** Interactive map with nearby donation centers
- **Profile:** Update personal info, medical history, notification preferences

### Staff Portal
- **Dashboard:** Daily metrics, pending approvals, recent activities
- **Events:** Create/manage donation events, set capacity, view registrations
- **Workflow:** Step-by-step donation process (check-in → screening → collection → completion)
- **Inventory:** Real-time blood stock levels, add/remove units, expiry alerts
- **Appointments:** Approve/reject requests, view donor details
- **Donors:** Search donors, view profiles, check eligibility

### Admin Portal
- **Dashboard:** System-wide analytics, charts, KPIs
- **User Management:** Create/edit/delete users, assign roles
- **Staff Management:** Manage staff accounts and permissions
- **Locations:** Add/edit donation centers with coordinates
- **Blog:** Create educational content with rich text editor
- **Documents:** Upload policies and guidelines
- **Reports:** Generate and export system reports

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Development deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

### Manual Build Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm run start
   ```

3. **Deploy `.next` folder to your hosting provider**

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_SIGNALR_URL=https://your-api-domain.com
NEXT_PUBLIC_MAP_API_KEY=production_mapbox_key
```

### Continuous Deployment

Vercel automatically deploys on every push to the main branch:
- **Pull Requests:** Preview deployments
- **Main Branch:** Production deployments

---

## 🤝 Contributing

While this is currently a solo project for portfolio purposes, suggestions and feedback are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Write clean, self-documenting code
- Add comments for complex logic
- Create reusable components
- Use proper naming conventions

---

## 📄 License

This project is developed for educational and portfolio purposes.

---

## 📊 Project Statistics

- **Development Time:** 4 months (5/2025 - 8/2025)
- **Lines of Code:** ~10,000+
- **React Components:** 50+ components
- **Pages/Routes:** 30+ pages
- **API Integrations:** 40+ endpoints
- **Third-party Libraries:** 20+ packages

---

<div align="center">

### ⭐ If you find this project helpful, please consider giving it a star!

**Built with ❤️ and ☕ by Son**

[Back to Top](#-bdss-frontend)

</div>
