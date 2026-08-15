# HeatGuard AI

> **FortyGuard Global AI Hackathon '26 - Track 01 & Track 06 Combined Solution**

A unified platform for city planners and emergency responders featuring an interactive hyperlocal heat map and route planner (Track 01), powered by an autonomous AI Agent (Track 06) that analyzes temperature data and provides actionable emergency recommendations.

## 🏆 Project Overview

HeatGuard AI combines:
- **Resilient Cities & Infrastructure (Track 01)**: Interactive heat maps, safe route planning, emergency zone identification
- **AI Agent Tools (Track 06)**: Autonomous AI assistant for data analysis and decision support

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd heatguard-ai/backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000`

### Frontend Setup
```bash
cd heatguard-ai/frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

## 📊 Features

### Track 01: Resilient Cities
- ✅ Interactive heat map visualization
- ✅ Safe route planning based on temperature data
- ✅ Emergency zone identification
- ✅ Real-time temperature monitoring

### Track 06: AI Agent Tools
- ✅ Natural language querying
- ✅ Data-driven recommendations
- ✅ Emergency response suggestions
- ✅ Hospital and shelter location analysis

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mock-heat-data` | Returns mock temperature data |
| POST | `/api/agent-query` | Analyze data with AI agent |
| GET | `/api/heat-map?location={city}` | Get heat map data |
| POST | `/api/route` | Calculate safest route |

## 🗺️ Current Status
- Mock data implemented (ready for development)
- FastAPI backend with all endpoints
- Next.js frontend with interactive map
- AI chat widget integrated
- Route planner with temperature-aware routing

## 🔑 Integration with Real API
See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for instructions to replace mock data with the real FortyGuard Temperature API key (available August 18).

## 👥 Team Roles
- **Dharmendra**: Backend & AI Agent Logic
- **Suraj**: Backend & API Integration
- **Amit**: Frontend & Map Visualization

## 🏆 Judging Criteria Addressed

### Track 01: Resilient Cities
- [x] Geospatial data visualization
- [x] Infrastructure planning tools
- [x] Emergency response capabilities
- [x] Public safety features

### Track 06: AI Agent Tools
- [x] Autonomous AI analysis
- [x] Natural language interface
- [x] Actionable recommendations
- [x] Integration with domain-specific data

## 📦 Tech Stack

**Backend:**
- FastAPI (Python)
- Pydantic (Data validation)
- Uvicorn (ASGI server)

**Frontend:**
- Next.js 14 (React)
- Tailwind CSS (Styling)
- Leaflet.js (Maps)
- React Query (Data fetching)

**AI:**
- Rule-based logic (current)
- LLM integration (future - OpenAI/Anthropic)

## 🎨 UI Components

1. **HeatMap Dashboard**: Visual representation of temperature zones
2. **CoolRoute Planner**: Find safest paths between locations
3. **AIChat Widget**: Floating chat for natural language queries
4. **Emergency Alerts**: Real-time notifications for extreme heat

## 📞 Contact
For questions or support, contact the development team.

---

**Built for FortyGuard Global AI Hackathon '26**
