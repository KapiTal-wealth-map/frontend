# Wealth Map Hackathon Project Plan

## Project Overview

The Wealth Map application will be a real estate data visualization platform that helps users identify property ownership patterns and wealth concentration across regions. The platform will combine property data, ownership information, and wealth metrics to create an intuitive, interactive map interface that reveals patterns of property ownership and wealth distribution.

## Repository Structure for 2-Person Team

We are developing this project as two separate repositories:

- **Frontend Repository**: All client-side code (UI, map, user flows)
- **Backend Repository**: All server-side code (APIs, data processing, integration)

This separation allows each team member to focus on their area of expertise, while enabling parallel development and clear boundaries.

## Project Structure

### 1. Frontend (Separate Repo)

- **Technology Stack**: React + TypeScript, Vite, Tailwind CSS
- **Main Components**:
  - Map Interface (Main View)
  - Property Information Panel
  - Owner Profile View
  - Search & Filter Components 
  - Data Export & Reporting
  - User Authentication & Dashboard

### 2. Backend (Separate Repo)

- **Technology Stack**: Node.js, Express.js, PostgreSQL (with PostGIS), Prisma ORM
- **Main Components**:
  - REST/GraphQL API for data access
  - Authentication Service
  - Data Processing Services
  - Third-Party API Integration Layer
  - Geospatial Query Service
  - Data Export Service

### 3. Data Layer

- **Property Database**
  - Property details (address, size, type, zoning)
  - Ownership records
  - Valuation history
  - Tax information

- **Owner Database**
  - Individual/Company profiles
  - Portfolio of properties
  - Wealth metrics
  - Ownership network

- **Geospatial Database**
  - Map tile data
  - Geographic boundaries (neighborhoods, districts, etc.)
  - Heat map data for visualizations

## Tech Stack Selection & Justification

### Frontend
- React.js + TypeScript: Component reusability, type safety
- Vite: Lightning-fast dev/build tooling for React
- Mapbox GL JS: Advanced mapping and visualization
- TailwindCSS: Fast, consistent UI development
- React Query & Zustand: Data fetching and UI state management

### Backend
- Node.js + Express: Fast API development
- Prisma ORM: Type-safe DB access, migrations
- PostgreSQL + PostGIS: Geospatial queries
- Redis: Caching for performance
- GraphQL (Apollo): Flexible data fetching
- Bull Queue: Async tasks (reporting, imports)

### DevOps & Testing
- Docker & Docker Compose: Consistent environments
- Vercel: Frontend deployments (or Netlify, Render, etc. for Vite apps)
- GitHub Actions: CI/CD
- Jest, Cypress: Critical path testing
- Sentry: Error monitoring

## Development Strategy for 2-Person Team

- **Strict MVP**: Ruthlessly prioritize must-have features
- **Feature Flags**: Ship incomplete features behind toggles if needed
- **Timebox Research**: No more than 2 hours stuck on a problem
- **Automate Early**: Prettier, ESLint, CI checks from day 1
- **Daily Integration**: Avoid merge conflicts, keep both repos in sync
- **Kanban Board**: Track tasks, blockers, and progress
- **Documentation-Driven**: Write docs alongside code

## Risk Mitigation
- Timebox research spikes
- Use feature flags for incomplete features
- Automate formatting/linting/testing

## Communication
- Daily standups and syncs
- Shared changelog for key decisions

---

## (Legacy) Detailed File Structure & Functionality

*The following sections may reference a single-repo setup—please refer to the above for the new split-repo structure for frontend and backend.*

### Frontend Structure

```
/frontend
  /public
    /assets
      /images
      /icons
  /src
    /components
      /Map
        MapContainer.tsx       # Main map component
        MapControls.tsx        # Zoom, pan, and other map controls
        PropertyMarker.tsx     # Individual property marker
        HeatMapLayer.tsx       # Wealth concentration visualization  
      /PropertyInfo
        PropertyCard.tsx       # Property summary card
        PropertyDetails.tsx    # Full property details view
        ValuationHistory.tsx   # Property value over time chart
      /OwnerProfile 
        OwnerCard.tsx          # Owner summary card
        PortfolioView.tsx      # Owner's property portfolio
        NetworkView.tsx        # Ownership connections visualization
      /Search
        SearchBar.tsx          # Main search interface
        FilterPanel.tsx        # Advanced filtering options
        SearchResults.tsx      # Display search results
      /Authentication
        LoginForm.tsx          # User login 
        RegisterForm.tsx       # User registration
        UserProfile.tsx        # User profile management
      /Dashboard
        Dashboard.tsx          # User dashboard
        SavedSearches.tsx      # Saved searches management
        Favorites.tsx          # Favorite properties/owners
      /Export
        ExportOptions.tsx      # Data export options
        ReportGenerator.tsx    # Custom report creation
    /services
      api.ts                   # API service for backend communication
      auth.ts                  # Authentication service
      mapService.ts            # Map-related services
      geocodingService.ts      # Address to coordinates conversion
    /hooks
      useProperties.ts         # Custom hook for property data
      useOwners.ts             # Custom hook for owner data
      useMapState.ts           # Custom hook for managing map state
    /store
      /slices                  # Redux slices for state management
        propertySlice.ts
        ownerSlice.ts
        mapSlice.ts
        userSlice.ts
      store.ts                 # Redux store configuration
    /utils
      formatters.ts            # Data formatting utilities
      validators.ts            # Input validation utilities
      mapUtils.ts              # Map-specific utility functions
    /pages
      index.tsx                # Home page with map
      /property/[id].tsx       # Property details page
      /owner/[id].tsx          # Owner profile page
      /search.tsx              # Advanced search page
      /dashboard.tsx           # User dashboard page
      /reports.tsx             # Reports and exports page
    /styles
      globals.css              # Global styles
      theme.ts                 # Theme configuration
    /types
      index.ts                 # TypeScript type definitions
    vite.config.js            # Vite configuration
```

### Backend Structure

```
/backend
  /src
    /controllers
      propertyController.js    # Property-related request handlers
      ownerController.js       # Owner-related request handlers
      userController.js        # User-related request handlers
      searchController.js      # Search-related request handlers
      exportController.js      # Export-related request handlers
    /models
      Property.js              # Property data model
      Owner.js                 # Owner data model
      User.js                  # User data model
      OwnershipRecord.js       # Property ownership record model
    /routes
      propertyRoutes.js        # Property API routes
      ownerRoutes.js           # Owner API routes
      userRoutes.js            # User API routes
      searchRoutes.js          # Search API routes
      exportRoutes.js          # Export API routes
    /services
      propertyService.js       # Property business logic
      ownerService.js          # Owner business logic 
      searchService.js         # Search functionality
      geocodingService.js      # Address geocoding service
      exportService.js         # Data export service
    /utils
      validators.js            # Input validation utilities
      formatters.js            # Data formatting utilities
      errorHandler.js          # Error handling utilities
    /middleware
      auth.js                  # Authentication middleware
      rateLimit.js             # Rate limiting middleware
      errorMiddleware.js       # Error handling middleware
    /config
      database.js              # Database configuration
      server.js                # Server configuration
      auth.js                  # Authentication configuration
    /integrations
      propertyDataAPI.js       # Property data API integration
      taxRecordsAPI.js         # Tax records API integration
      geospatialAPI.js         # Geospatial data API integration
    app.js                     # Express application setup
    server.js                  # Server entry point
  .env                         # Environment variables
  package.json                 # Project dependencies
```

## Main Functionality

### 1. Interactive Map Interface

- **Real-time property visualization** with color-coded markers indicating property values
- **Heat map overlay** showing wealth concentration by area
- **Layered visualization** allowing users to toggle between different data views (property value, ownership concentration, etc.)
- **Smooth zoom and pan** functionality with clustering for better performance

### 2. Property Information Display

- **Detailed property cards** showing key information (address, size, value, zoning)
- **Ownership history** with timeline visualization
- **Valuation trends** with interactive charts
- **Tax information** including assessment history and tax payments
- **Related properties** owned by the same individual/entity

### 3. Owner Wealth Analysis

- **Owner profiles** with portfolio overview
- **Wealth estimation** based on property holdings
- **Ownership network visualization** showing connections between entities
- **Portfolio metrics** including total value, geographic distribution, and property types
- **Timeline view** of acquisition history

### 4. Advanced Search & Filtering

- **Multi-criteria search** by location, property characteristics, owner information
- **Price range filters** with customizable parameters
- **Ownership filters** to find properties by owner type (individual, corporate, trust)
- **Geographic filters** with draw-on-map functionality
- **Value change filters** to identify properties with significant appreciation/depreciation

### 5. Data Export & Reporting

- **Custom report builder** with selectable data points
- **Export options** (PDF, CSV, Excel)
- **Visualization exports** for presentations
- **Scheduled report generation** for premium users
- **API access** for data integration with other systems

### 6. User Management

- **User registration and authentication**
- **Saved searches and favorites**
- **Customizable dashboard**
- **Usage analytics**
- **Subscription management** for premium features

## Workflow Diagrams

### 1. User Interaction Flow

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ User Enters │     │ Map Interface │     │ Property Search │
│  Platform   │────►│   Loads      │────►│ and Filtering   │
└─────────────┘     └──────────────┘     └────────────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ Data Export │     │ Owner Wealth │     │ Property Detail │
│ & Reporting │◄────│   Analysis   │◄────│      View       │
└─────────────┘     └──────────────┘     └────────────────┘
```

### 2. Data Flow Diagram

```
┌───────────────┐    ┌─────────────┐    ┌────────────────┐
│ External Data  │    │             │    │                │
│ Sources        │───►│ Data Import │───►│ Data Processing│
│ (APIs)         │    │ Service     │    │ & Enrichment   │
└───────────────┘    └─────────────┘    └────────────────┘
                                                │
                                                ▼
┌───────────────┐    ┌─────────────┐    ┌────────────────┐
│ Client         │    │             │    │                │
│ Applications   │◄───│ REST API    │◄───│ Database Layer │
│ (Web/Mobile)   │    │ Endpoints   │    │                │
└───────────────┘    └─────────────┘    └────────────────┘
```

### 3. Authentication Flow

```
┌───────────┐    ┌─────────────┐    ┌──────────────┐
│ User      │    │ Login/      │    │ Authentication│
│ (Browser) │───►│ Register    │───►│ Service       │
└───────────┘    └─────────────┘    └──────────────┘
                                            │
                                            ▼
┌───────────┐    ┌─────────────┐    ┌──────────────┐
│ Protected │    │ JWT Token   │    │ User Database │
│ Resources │◄───│ Validation  │◄───│ Check         │
└───────────┘    └─────────────┘    └──────────────┘
```

## Technical Implementation

### 1. Map Visualization

- Use **Mapbox GL JS** or **Google Maps API** for the base map layer
- Implement custom overlays with **D3.js** for data visualization
- Utilize **WebGL** for efficient rendering of large datasets
- Implement **clustering algorithms** to manage marker density
- Add **GeoJSON** support for boundary visualizations

### 2. Data Architecture

- Design a **normalized database schema** for efficient queries
- Implement **geospatial indexing** for location-based queries
- Create a **caching layer** with Redis for frequently accessed data
- Set up **scheduled data updates** for external data sources
- Design an **audit trail system** for tracking data changes

### 3. API Design

- Develop a **RESTful API** with clear resource endpoints
- Implement **GraphQL** for flexible data queries
- Add **pagination** for large result sets
- Ensure proper **error handling** and status codes
- Implement **rate limiting** to prevent abuse

### 4. Security Measures

- Use **JWT** for secure authentication
- Implement **role-based access control**
- Set up **HTTPS** for all connections
- Add **data validation** for all inputs
- Conduct regular **security audits**

### 5. Performance Optimization

- Optimize **database queries** with proper indexing
- Implement **lazy loading** for map assets
- Use **server-side rendering** for initial page load
- Add **client-side caching** for frequent data
- Implement **code splitting** for faster page loads

## Application Features

# Wealth Map - Real Estate Ownership & Wealth Visualization Platform

Wealth Map is an interactive platform designed to visualize property ownership patterns and wealth concentration across geographic regions. The application combines real estate data, ownership records, and wealth metrics to create an intuitive map-based interface for exploring ownership patterns and wealth distribution.

## Features

- **Interactive Property Map**: Explore real estate with color-coded markers showing property values and ownership
- **Wealth Concentration Visualization**: Heat maps displaying areas of concentrated wealth and ownership
- **Owner Profiles**: Detailed profiles of property owners, including their complete real estate portfolios
- **Ownership Networks**: Visual representation of connections between related owners and entities
- **Advanced Search & Filtering**: Find properties by multiple criteria including location, value, owner type, and more
- **Data Export & Reporting**: Generate custom reports and export data for further analysis

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build and development
- Mapbox GL JS for map visualization
- D3.js for data visualization
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for flexible data storage
- PostgreSQL with PostGIS for geospatial queries
- Redis for caching
- GraphQL (Apollo): Flexible data fetching
- Bull Queue: Async tasks (reporting, imports)

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- PostgreSQL with PostGIS extension
- API keys for map services (Mapbox/Google Maps)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/wealth-map.git
   cd wealth-map
   ```

2. Install dependencies
   ```
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables
   ```
   # In backend directory
   cp .env.example .env
   # Edit .env with your configuration

   # In frontend directory
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run the development servers
   ```
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend server
   cd frontend
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data providers for real estate and ownership information
- Open source community for the amazing tools and libraries

## Judging Criteria Alignment

### Technical Implementation (30%)
- Robust, scalable architecture using industry-standard technologies
- Clean, maintainable code with proper separation of concerns
- Efficient data processing and storage solutions
- Secure authentication and authorization system

### User Experience (25%)
- Intuitive, responsive interface with modern design principles
- Smooth map navigation and information display
- Clear visualization of complex ownership data
- Accessible across different devices and screen sizes

### Feature Implementation (25%)
- Comprehensive property information display
- Detailed owner wealth analysis and network visualization
- Advanced search and filtering capabilities
- Flexible data export and reporting options

### Business Viability (20%)
- Clear value proposition for target users (investors, researchers, policymakers)
- Scalable business model with premium feature options
- Potential for integration with existing real estate platforms
- Addressing a growing market need for ownership transparency

## Conclusion

The Wealth Map platform will provide an innovative way to visualize and understand patterns of property ownership and wealth concentration. By combining intuitive mapping interfaces with rich data analysis, the platform will offer valuable insights for investors, researchers, policymakers, and interested citizens. The technical implementation focuses on performance, scalability, and user experience, ensuring that the platform can handle large datasets while remaining accessible and informative for users.