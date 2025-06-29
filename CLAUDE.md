# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CFI Nexus is a Next.js 15 enterprise application for CFI Tire's operations management, featuring:
- **Inspection Management**: 14 different inspection form types for tire and equipment inspection
- **Business Central Integration**: ERP integration for sales orders, purchase orders, locations, and shipments
- **Dataverse CRM Integration**: Customer relationship management with accounts, contacts, and opportunities
- **RBAC System**: Role-based access control with Azure AD integration and granular permissions
- **Password Vault**: Encrypted password management with folder organization and sharing capabilities
- **Analytics Dashboard**: Shipment tracking with Azure Maps integration and delivery performance metrics

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed Prisma database

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio
```

## Architecture Overview

### Authentication & Authorization
- **NextAuth.js** with Azure AD provider (`lib/auth.ts`)
- **RBAC System** (`lib/rbac.ts`, `hooks/use-rbac.ts`) with:
  - User groups with hierarchical permissions
  - Module-based access control (vault, inspections, analytics)
  - Action-based permissions (create, read, update, delete, share)
  - Database-driven permission management (`prisma/schema.prisma`)

### Business Central Integration
- **API Client** (`lib/business-central.ts`) with OAuth2 authentication
- **Mock Data Fallback** when `BC_DISABLE_API=true` for development
- **Endpoints**: Sales orders, purchase orders, locations, salespersons, inspections, shipments
- **Custom Tables**: `Nexus_Inspections_Header`, `Nexus_Inspections_Lines`, `Nexus_Shipments`

### CRM Integration
- **CRM Module** accessible at `/crm` with comprehensive dashboard including:
  - Dashboard tab with overview metrics
  - Channels, Territories, Segments management
  - Mapping & Routing capabilities
  - Reports and analytics
- **Dedicated Entity Pages**: `/crm/accounts`, `/crm/contacts`, `/crm/leads`
- **Dataverse Integration** (`lib/dataverse.ts`) with OAuth2 authentication
- **Mock Data Fallback** when `DV_DISABLE_API=true` for development
- **Navigation**: CRM appears as collapsible sidebar section with sub-items

### Database Schema (Prisma)
- **Users & Groups**: RBAC user management
- **Vault System**: Encrypted passwords with folder organization
- **Audit Trails**: Password access logging and sharing history
- **Sessions**: NextAuth session management

### Component Architecture
- **UI Components**: shadcn/ui with orange theme customization
- **Form Templates**: Standardized inspection form component (`components/form-template.tsx`)
- **Data Tables**: Reusable table component with sorting/filtering
- **Navigation**: Sidebar-based navigation with permission-based filtering and collapsible sections:
  - Main navigation (Dashboard, Lifecycle, Team, Shipments)
  - Apps section (Vault, Analytics) 
  - CRM section with sub-items (Dashboard, Accounts, Contacts, Leads)
  - Inspections collapsible section with 14 inspection types
  - Secondary navigation (Settings, Help, Search)

## Key Patterns

### API Routes
- Located in `app/api/` following App Router conventions
- Consistent error handling with proper HTTP status codes
- Authentication checks using `auth()` from NextAuth
- Business Central integration patterns with mock fallbacks

### Component Structure
- Kebab-case naming convention (e.g., `account-button.tsx`)
- Minimal `page.tsx` files with logic extracted to components
- Consistent use of shadcn/ui components
- TypeScript with proper type definitions

### Security Patterns
- **Encryption**: AES-256-GCM for password vault (`lib/encryption.ts`)
- **RBAC Checks**: `useRBAC()` hook for component-level access control
- **API Protection**: Server-side permission validation
- **Audit Logging**: Comprehensive access and sharing logs

### Environment Configuration
```bash
# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Business Central
BC_BASE_URL=
BC_TENANT_ID=
BC_CLIENT_ID=
BC_CLIENT_SECRET=
BC_ENVIRONMENT=
BC_COMPANY=
BC_DISABLE_API=true  # For development with mock data

# Dataverse CRM
DATAVERSE_BASE_URL=https://yourorg.crm.dynamics.com
DATAVERSE_TENANT_ID=
DATAVERSE_CLIENT_ID=
DATAVERSE_CLIENT_SECRET=
DATAVERSE_ENVIRONMENT=default
DV_DISABLE_API=true  # For development with mock data

# Database
DATABASE_URL=

# Encryption
ENCRYPTION_KEY=  # For password vault

# Azure Maps
NEXT_PUBLIC_AZURE_MAPS_KEY=

# FreePBX Communications
FREEPBX_BASE_URL=https://your-freepbx-server.com
FREEPBX_USERNAME=
FREEPBX_PASSWORD=
FREEPBX_API_TOKEN=  # Optional, preferred over username/password
FREEPBX_DISABLE_API=true  # For development with mock data
NEXT_PUBLIC_FREEPBX_DOMAIN=your-freepbx-server.com
NEXT_PUBLIC_WEBRTC_PASSWORD=  # WebRTC extension password
```

## Important Implementation Details

### Inspection Forms
- 14 different inspection types in `app/inspections/`
- Standardized form structure using `form-template.tsx`
- Dynamic field mapping to Business Central tables
- Custom field support via JSON serialization

### Vault System
- Hierarchical folder structure with sharing permissions
- Individual password sharing with expiration dates
- Encrypted storage with secure key derivation
- Audit trail for all access and modifications

### RBAC Implementation
- Groups can contain users and inherit permissions
- Module-based access: `vault`, `inspections`, `analytics`, `admin`, `crm`, `communications`
- Action-based permissions: `create`, `read`, `update`, `delete`, `share`, `manage`
- UI components automatically hide based on permissions
- Navigation sections filter based on module access (e.g., CRM section only shows if user has 'crm' access)

### Communications Integration
- **FreePBX Integration**: AMI and REST API support with WebRTC browser calling
- **WebRTC Phone**: Browser-based calling using SIP.js with STUN/TURN support
- **Call Management**: Originate, answer, hangup, transfer, and mute functionality
- **Call History**: Comprehensive call logging with search and export capabilities
- **Dataverse Integration**: Click-to-call from contacts with automatic activity logging
- **RBAC Protection**: Module requires 'communications' access with granular permissions

### Business Central Integration
- OAuth2 client credentials flow
- Automatic token refresh with expiry management
- Custom API endpoints for CFI-specific data
- Graceful fallback to mock data during development

## Development Guidelines

- **File Organization**: Prefer editing existing files over creating new ones
- **Component Pattern**: Extract logic from pages to reusable components
- **Naming Convention**: Use kebab-case for all file and component names
- **Security First**: Always implement RBAC checks for protected features
- **Error Handling**: Provide meaningful error messages and fallbacks
- **Type Safety**: Use TypeScript interfaces for all data structures

## Project Memories
- Anytime we set up a new app or anything that will require RBAC permissions add them to the Nexus-SuperAdministrators group please
- CRM module has been added with full RBAC protection - requires 'crm' module access
- Communications module has been added with full RBAC protection - requires 'communications' module access
- SuperAdministrators group has access to all modules including CRM and Communications
- the sidebar and header should show on every module