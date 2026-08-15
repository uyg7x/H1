# HeatGuard AI - Project Structure

> **FortyGuard Global AI Hackathon '26 - Complete Project Structure**

This document provides a complete overview of the HeatGuard AI project structure, combining **Track 01 (Resilient Cities & Infrastructure)** and **Track 06 (AI Agent Tools)**.

---

## 📁 Project Root Structure

```
heatguard-ai/
├── backend/                          # FastAPI Backend (Python)
│   ├── main.py                       # Main FastAPI application
│   ├── models.py                     # Pydantic models
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules
│   └── components/                   # Backend components
│       └── __init__.py
│
├── frontend/                         # Next.js Frontend (TypeScript)
│   ├── pages/                        # Next.js pages
│   │   ├── _app.tsx                  # Custom App component
│   │   ├── index.tsx                 # Main dashboard page
│   │   └── api/                      # API routes
│   │       └── hello.ts              # API route example
│   │
│   ├── components/                   # React components
│   │   ├── Layout.tsx                # Main layout
│   │   ├── Sidebar.tsx               # Sidebar with city selector
│   │   ├── HeatMap.tsx               # Interactive heat map
│   │   ├── index.ts                  # Component exports
│   │   │
│   │   ├── alerts/                  # Alert components
│   │   │   └── EmergencyAlertBar.tsx
│   │   │
│   │   ├── chat/                    # AI Chat components
│   │   │   └── AIChatWidget.tsx
│   │   │
│   │   ├── locations/               # Location components
│   │   │   └── LocationList.tsx
│   │   │
│   │   ├── planner/                 # Route planning components
│   │   │   └── RoutePlanner.tsx
│   │   │
│   │   └── stats/                   # Statistics components
│   │       └── StatisticsPanel.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useApi.ts                 # API data fetching hooks
│   │   ├── useMap.ts                 # Map state management hooks
│   │   └── index.ts
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── api.ts                    # API client and functions
│   │   ├── constants.ts              # Application constants
│   │   └── index.ts
│   │
│   ├── types/                       # TypeScript types
│   │   └── index.ts                  # All type definitions
│   │
│   ├── styles/                      # Global styles
│   │   └── globals.css               # Tailwind CSS + custom styles
│   │
│   ├── public/                      # Static files
│   │
│   ├── package.json                 # npm dependencies
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.ts           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── .env.local.example           # Frontend environment template
│   └── .gitignore                    # Git ignore rules
│
├── README.md                         # Main README
├── INTEGRATION_GUIDE.md             # API integration guide
├── PROJECT_STRUCTURE.md             # This file
└── .gitignore                        # Root git ignore
```

---

## 🏗️ Backend Structure (FastAPI)

### Main Files

#### `backend/main.py`
- FastAPI application setup
- CORS configuration
- Mock data generators
- AI Agent logic (rule-based)
- Route planning logic
- Emergency alert logic
- All API endpoints

**Key Endpoints:**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/mock-heat-data` - Temperature data (Track 01)
- `GET /api/heat-map` - Extended heat map data (Track 01)
- `GET /api/zones` - Heat zone polygons (Track 01)
- `POST /api/route` - Plan safe route (Track 01)
- `GET /api/emergency-alerts` - Emergency alerts (Track 01)
- `POST /api/agent-query` - AI Agent query (Track 06)
- `POST /api/agent-analyze` - Alternative agent endpoint (Track 06)
- `GET /api/cities` - Available cities
- `GET /api/statistics` - Comprehensive statistics

#### `backend/models.py`
- Pydantic models for all data structures
- Temperature data models
- Heat zone models
- Route planning models
- AI Agent models
- Emergency alert models
- API response wrappers

### Dependencies

```python
# Core
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
python-dotenv==1.0.0

# HTTP Client (for real API)
httpx==0.26.0

# Optional
geopy==2.4.1  # For geospatial calculations
```

---

## 🎨 Frontend Structure (Next.js + React + TypeScript)

### Pages

#### `pages/_app.tsx`
- Custom App component
- QueryClientProvider setup
- Layout wrapper
- Global CSS imports

#### `pages/index.tsx`
- Main dashboard page
- HeatMap component integration
- State management
- Route and location selection handlers

### Components

#### Layout Components
- **Layout.tsx**: Main application layout
  - Header with branding
  - Sidebar integration
  - Theme toggle
  - AI Chat Widget integration

- **Sidebar.tsx**: Left sidebar
  - City selector
  - Temperature info panel
  - Tab navigation (Temperature, Route, Locations, Stats)
  - Component switching based on active tab

#### Map Components
- **HeatMap.tsx**: Interactive map visualization
  - Leaflet map integration
  - Heat layer management
  - Marker layer management
  - Route layer management
  - Map controls
  - Map legend

#### AI Agent Components (Track 06)
- **AIChatWidget.tsx**: Floating chat widget
  - Message history
  - Quick query buttons
  - Loading indicators
  - Minimize/maximize functionality

#### Route Planning Components (Track 01)
- **RoutePlanner.tsx**: Route planning form
  - Start/end location inputs
  - Optimization options (Safety, Balanced, Speed)
  - Advanced options (avoid extreme, max temperature)
  - Route result display

#### Location Components (Track 01)
- **LocationList.tsx**: Emergency location browser
  - Grouped by type (Hospitals, Cooling Centers, etc.)
  - Expandable groups
  - Risk level indicators
  - LocationCard component

#### Alert Components (Track 01)
- **EmergencyAlertBar.tsx**: Top alert bar
  - Critical alert display
  - Alert details dropdown
  - Dismiss functionality

#### Statistics Components
- **StatisticsPanel.tsx**: Comprehensive stats
  - Risk assessment
  - Temperature metrics
  - Emergency location summary
  - Temperature distribution
  - Recommendations

### Hooks

#### `hooks/useApi.ts`
- **Query Hooks:**
  - `useTemperatureData()` - Fetch temperature data
  - `useHeatMapData()` - Fetch heat map data
  - `useHeatZones()` - Fetch heat zones
  - `useEmergencyAlerts()` - Fetch emergency alerts
  - `useAvailableCities()` - Fetch available cities
  - `useStatistics()` - Fetch statistics
  - `useHealthCheck()` - Health check

- **Mutation Hooks:**
  - `usePlanRouteMutation()` - Plan a route
  - `useAgentQueryMutation()` - Query AI agent
  - `useAgentAnalyzeMutation()` - Analyze with agent

- **Combined Hooks:**
  - `useDashboardData()` - All data for dashboard

- **Prefetching Hooks:**
  - `usePrefetchData()` - Prefetch data

#### `hooks/useMap.ts`
- **Map State:**
  - `useMap()` - Map reference, center, zoom, bounds management

- **Layer Management:**
  - `useHeatLayer()` - Heat zone polygon layer
  - `useMarkerLayer()` - Emergency location markers
  - `useRouteLayer()` - Route polyline and markers

### Types

#### `types/index.ts`
- **API Response Types:**
  - `TemperatureData`
  - `HeatZone`
  - `RouteOption`
  - `EmergencyLocation`
  - `HeatMapData`

- **Route Planning Types:**
  - `RouteOptimization`
  - `RoutePoint`
  - `RouteSegment`
  - `PlannedRoute`
  - `RouteRequest`

- **AI Agent Types:**
  - `AgentAction`
  - `AgentQuery`
  - `AgentResponse`
  - `EmergencyAlert`

- **UI State Types:**
  - `MapBounds`
  - `MapViewState`
  - `UIState`
  - `LatLng`

- **Message Types:**
  - `ChatMessage`
  - `Notification`

### Libraries

#### `lib/api.ts`
- Axios API client configuration
- Request/response interceptors
- All API endpoint functions:
  - `checkHealth()`
  - `getMockTemperatureData()`
  - `getHeatMapData()`
  - `getHeatZones()`
  - `planRoute()`
  - `getEmergencyAlerts()`
  - `queryAgent()`
  - `analyzeWithAgent()`
  - `getAvailableCities()`
  - `getStatistics()`
  - Generic HTTP methods

#### `lib/constants.ts`
- **API Configuration:**
  - `API_CONFIG`

- **Map Configuration:**
  - `MAP_CONFIG`

- **Temperature Thresholds:**
  - `TEMPERATURE_THRESHOLDS`

- **Risk Level Colors:**
  - `RISK_COLORS`

- **Risk Level Icons:**
  - `RISK_ICONS`

- **Location Types:**
  - `LOCATION_TYPES`

- **UI Configuration:**
  - `UI_CONFIG`

- **Theme Configuration:**
  - `THEME`

- **Form Configuration:**
  - `FORMS`

- **Error Messages:**
  - `ERROR_MESSAGES`

- **Success Messages:**
  - `SUCCESS_MESSAGES`

- **Storage Keys:**
  - `STORAGE_KEYS`

- **Feature Flags:**
  - `FEATURE_FLAGS`

### Styles

#### `styles/globals.css`
- Tailwind CSS directives
- Theme variables (CSS custom properties)
- Custom scrollbar styles
- Leaflet map custom styles
- HeatGuard-specific animations
- Utility classes
- Responsive adjustments
- Print styles

---

## 📊 Feature Mapping to Tracks

### Track 01: Resilient Cities & Infrastructure

| Feature | Component/File | Description |
|--------|---------------|-------------|
| Interactive Heat Map | `HeatMap.tsx` | Visual heat map with zones |
| Temperature Data | `useTemperatureData()`, `getMockTemperatureData()` | Real-time temperature info |
| Heat Zones | `useHeatZones()`, `getHeatZones()` | Geographic zones with temperature |
| Safe Route Planning | `RoutePlanner.tsx`, `planRoute()` | Temperature-aware route planning |
| Emergency Locations | `LocationList.tsx`, `useMarkerLayer()` | Hospitals, cooling centers, etc. |
| Emergency Alerts | `EmergencyAlertBar.tsx`, `getEmergencyAlerts()` | Critical heat alerts |
| Statistics Dashboard | `StatisticsPanel.tsx` | Comprehensive analytics |

### Track 06: AI Agent Tools

| Feature | Component/File | Description |
|--------|---------------|-------------|
| AI Agent Chat | `AIChatWidget.tsx` | Natural language interface |
| Agent Query | `queryAgent()`, `analyzeWithAgent()` | Rule-based AI analysis |
| Data-Driven Recommendations | `generate_agent_response()` | Actionable suggestions |
| Emergency Response | Agent logic | Critical alert handling |
| Location Analysis | Agent logic | Find hospitals, cooling centers |
| Route Recommendations | Agent logic | Safest route suggestions |

---

## 🔗 Component Relationship Diagram

```
Layout.tsx
├── Sidebar.tsx
│   ├── TemperatureInfoPanel (inline)
│   ├── RoutePlanner.tsx
│   ├── LocationList.tsx
│   └── StatisticsPanel.tsx
│
├── HeatMap.tsx
│   ├── MapContainer (dynamic import)
│   ├── TileLayer (dynamic import)
│   ├── Marker (dynamic import)
│   ├── useMap()
│   ├── useHeatLayer()
│   ├── useMarkerLayer()
│   └── useRouteLayer()
│
└── AIChatWidget.tsx

API Flow:
HeatMap.tsx → useHeatMapData() → api.ts → backend/main.py
Sidebar.tsx → useTemperatureData() → api.ts → backend/main.py
RoutePlanner.tsx → usePlanRouteMutation() → api.ts → backend/main.py
AIChatWidget.tsx → useAgentQueryMutation() → api.ts → backend/main.py
```

---

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs at: http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs at: http://localhost:3000
```

### Docker (Optional)
```bash
# Create docker-compose.yml and Dockerfiles for production deployment
```

---

## 📦 File Count Summary

| Category | Count | Location |
|----------|-------|----------|
| Python Files | 3 | backend/ |
| TypeScript Files | 20+ | frontend/ |
| Components | 10 | frontend/components/ |
| Hooks | 2 | frontend/hooks/ |
| Libraries | 2 | frontend/lib/ |
| Types | 1 | frontend/types/ |
| Pages | 2 | frontend/pages/ |
| Styles | 1 | frontend/styles/ |
| Configuration | 5+ | Various |
| Documentation | 3 | Root |

**Total Files:** ~40+ files
**Total Lines of Code:** ~5,000+ lines

---

## 🎯 Judging Criteria Coverage

### Track 01: Resilient Cities & Infrastructure ✅

- [x] **Geospatial Data Visualization**: Interactive Leaflet map with heat zones
- [x] **Infrastructure Planning Tools**: Route planner with temperature optimization
- [x] **Emergency Response Capabilities**: Emergency alerts and location tracking
- [x] **Public Safety Features**: Heat risk assessment and recommendations
- [x] **Real-time Monitoring**: Live temperature data display
- [x] **Data-Driven Decisions**: Statistics and analytics dashboard

### Track 06: AI Agent Tools ✅

- [x] **Autonomous AI Analysis**: Rule-based agent with data analysis
- [x] **Natural Language Interface**: Chat widget for queries
- [x] **Actionable Recommendations**: Data-driven suggestions
- [x] **Integration with Domain-Specific Data**: Temperature and heat data integration
- [x] **Decision Support**: Risk assessment and emergency response
- [x] **Intelligent Query Processing**: Understanding and responding to user queries

---

## 👥 Team Work Division

As suggested in the original prompt:

### Dharmendra & Suraj: Backend & AI Agent Logic
- `backend/main.py` - FastAPI application
- `backend/models.py` - Data models
- API endpoints for Track 01 & 06
- Mock data generation
- AI agent rule-based logic
- Route planning algorithm
- Emergency alert system

### Amit: Frontend & Map Visualization
- `frontend/components/HeatMap.tsx` - Interactive map
- `frontend/components/Sidebar.tsx` - Dashboard layout
- `frontend/components/Layout.tsx` - Main layout
- All other frontend components
- TypeScript types and hooks
- Tailwind CSS styling
- Responsive design

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Extreme | #dc2626 | Highest risk zones |
| High | #ea580c | High risk zones |
| Moderate | #f59e0b | Moderate risk zones |
| Low | #10b981 | Safe zones |
| Primary | #3b82f6 | Brand color |
| Background | #0f172a | Dark theme background |
| Text Primary | #f8fafc | Primary text |
| Text Secondary | #94a3b8 | Secondary text |

### Typography
- **Font Family:** Inter (system-ui fallback)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes:** text-xs (12px), text-sm (14px), text-base (16px), etc.

### Spacing
- Based on Tailwind's spacing scale (4px = 1 unit)
- Common: 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px)

### Shadows
- `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Custom: `shadow-glow-red`, `shadow-glow-green`

### Animations
- `pulse`, `bounce`, `spin`, `fade-in`, `slide-up`, `glow`
- Custom durations and easing

---

## 📝 Key Technical Decisions

1. **FastAPI for Backend**: Modern, fast, automatic OpenAPI docs
2. **Next.js for Frontend**: SSR, React, TypeScript, easy deployment
3. **Leaflet.js for Maps**: Lightweight, open-source, no API key required
4. **TanStack Query (React Query)**: Data fetching, caching, retries
5. **Zustand for State**: Lightweight state management (if needed)
6. **Tailwind CSS**: Utility-first styling, customizable
7. **TypeScript**: Type safety, better developer experience
8. **Rule-Based AI First**: Works without API key, easy to upgrade to LLM

---

## 🔧 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend Framework** | FastAPI | Python web framework |
| **Backend Validation** | Pydantic | Data validation |
| **Backend Server** | Uvicorn | ASGI server |
| **Frontend Framework** | Next.js | React framework |
| **Frontend Language** | TypeScript | Type-safe JavaScript |
| **Frontend Styling** | Tailwind CSS | Utility-first CSS |
| **Frontend State** | TanStack Query | Data fetching |
| **Frontend Maps** | Leaflet.js | Interactive maps |
| **Frontend Heat Map** | leaflet.heat | Heat layer visualization |
| **Frontend Icons** | Emoji | Simple, no dependencies |
| **HTTP Client** | Axios | API requests |
| **Package Manager** | npm | Frontend dependencies |
| **Python Package Manager** | pip | Backend dependencies |

---

## 📚 Dependencies Summary

### Backend Dependencies (~10 packages)
- fastapi, uvicorn, pydantic
- httpx (for real API calls)
- python-dotenv, python-multipart
- geopy (optional, for geospatial)
- Development: pytest, black, ruff

### Frontend Dependencies (~20 packages)
- next, react, react-dom
- leaflet, @react-leaflet/core
- leaflet.heat, leaflet-routing-machine
- axios
- @tanstack/react-query
- zustand (optional)
- uuid, date-fns, clsx, tailwind-merge
- TypeScript, tailwindcss, postcss, autoprefixer
- Development: prettier, eslint

---

**This project structure is optimized for the FortyGuard Global AI Hackathon '26, combining Track 01 and Track 06 for maximum impact and judging criteria coverage.**
