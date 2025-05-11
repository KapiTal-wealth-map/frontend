# Wealth Map Project – Detailed Timeline

_This timeline is based on the provided timeline.pdf and enhanced with strategic and technical insights from the README. The plan is structured for a 2-person team working in split frontend and backend repositories._

---

## Week 1: Infrastructure, Authentication, and Onboarding

### Member A (Backend)
- Set up backend repo and project structure
- Provision PostgreSQL + PostGIS database
- Implement authentication system (OAuth2.0, MFA)
- Create endpoints for:
  - Company registration
  - Employee invite & onboarding
  - Role-based access control
- Encrypt sensitive data in the database
- Start API for user sessions and access logs
- Deploy backend on Render/Railway (GCP/AWS if needed)
- Secure API keys and third-party credentials

### Member B (Frontend)
- Set up frontend repo with React + Vite + Tailwind CSS
- Build UI for:
  - Login/signup (with MFA)
  - Company admin dashboard (basic)
  - Invite form and onboarding flow
  - Terms of Service and notification preferences
- Implement secure auth flow with token storage
- Create initial project layout and navigation

### Shared
- Define API contracts for all auth/user actions
- Plan full schema for users, roles, companies
- Set up GitHub repo workflows and README
- Agree on code standards, linting, and CI/CD

---

## Week 2: Mapping, Data Integration, and Property Systems

### Member A (Frontend)
- Integrate map interface (Mapbox GL JS)
- Add property markers and clustering logic
- Implement zoom, pan, and toggle views
- Add filters: property value, size, location
- Add heat map layer for wealth distribution
- Start implementing Saved Search UI

### Member B (Backend)
- Integrate 3rd-party APIs:
  - Zillow (property value)
  - WealthEngine (net worth)
  - Fast People Search (ownership info)
- Build:
  - Consolidated owner profiles
  - Net worth estimates + confidence score
  - Transaction history endpoint
- Set up Redis for caching API responses
- Begin backend for "Wealth Trails" unique feature

### Shared
- Design DB schema for properties, ownership, wealth data
- Write property detail and search endpoints
- Set up monitoring/logging for API and database
- Test frontend ↔ backend integration for core map features

---

## Week 3: Final Features, Visualizations, and Demo Polish

### Member A (Frontend)
- Build detailed property card UI with expandable info
- Add owner net worth panel
- Implement "Wealth Trails" frontend interface (D3.js or Vis.js)
- Create Ownership Network Graph
- Add bookmarking and saved search UX
- Polish dashboards, transitions, and mobile responsiveness

### Member B (Backend)
- Finalize data export & scheduled report generator
- Finish "Wealth Trails" backend engine:
  - Track owner → property → owner chains
  - Cache historical wealth transitions
- Implement access logs and analytics for admin dashboard
- Write reports endpoint with export history
- Implement team sharing of property collections

### Shared
- Accessibility and performance optimization (lazy loading, map perf)
- Conduct security checks (input validation, rate limiting)
- Manual testing and bug fixing
- Prepare technical documentation and compliance docs
- Record demo video walkthrough (5 mins)
- Polish README and pitch materials

---

## Key Milestones & Deliverables
- **End of Week 1:** Core infrastructure, authentication, onboarding flows, and repos set up
- **End of Week 2:** Interactive map, property data integration, search/filter, and core API endpoints
- **End of Week 3:** Wealth Trails, ownership network, analytics, export, and all polish/demo materials

## Risk Mitigation & Best Practices
- Timebox research spikes (max 2 hours per blocker)
- Use feature flags for incomplete features
- Automate formatting/linting/testing
- Daily standups and end-of-day syncs
- Kanban board for tracking tasks and blockers
- Documentation-driven development

---

_This timeline ensures that both team members remain focused, productive, and aligned with the judging criteria, while balancing rapid prototyping with robust, scalable architecture._
