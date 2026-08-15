# HeatGuard AI - Integration Guide

> **How to Replace Mock Data with Real FortyGuard Temperature API Key**

This guide explains how to integrate the real FortyGuard Temperature API when your key becomes available on **August 18, 2026**.

---

## 📋 Table of Contents

1. [Getting Your API Key](#1-getting-your-api-key)
2. [Backend Integration](#2-backend-integration)
3. [Frontend Configuration](#3-frontend-configuration)
4. [Switching from Mock to Real Data](#4-switching-from-mock-to-real-data)
5. [API Endpoint Mapping](#5-api-endpoint-mapping)
6. [Testing the Integration](#6-testing-the-integration)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Getting Your API Key

### 📅 Key Availability
- **Date:** August 18, 2026
- **Source:** FortyGuard Global AI Hackathon organizers
- **Format:** 32-64 character alphanumeric string

### 🔑 How to Obtain
1. Check your email from FortyGuard organizers
2. Look for the subject: "Your FortyGuard Temperature API Access"
3. Copy the API key from the email
4. Store it securely (do not commit to version control)

---

## 2. Backend Integration

### 📁 Location: `backend/main.py`

### Step 1: Add Your API Key

Create or update the `.env` file in the `backend/` directory:

```bash
# backend/.env
FORTYGUARD_API_KEY=your_actual_api_key_here
FORTYGUARD_BASE_URL=https://api.fortyguard.com/v1
USE_MOCK_DATA=false  # Set to false to use real API
```

### Step 2: Update Configuration

In `backend/main.py`, find and update the following:

```python
# Change this line (around line 30-40)
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# Add these configurations
FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY", "")
FORTYGUARD_BASE_URL = os.getenv("FORTYGUARD_BASE_URL", "https://api.fortyguard.com/v1")
```

### Step 3: Create Real API Data Fetching Function

Replace or add the following function in `backend/main.py`:

```python
import httpx

async def fetch_real_temperature_data(location: str = "Phoenix, AZ") -> MockTemperatureData:
    """
    Fetch real temperature data from FortyGuard API
    """
    url = f"{FORTYGUARD_BASE_URL}/temperature"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                url,
                params={
                    "location": location,
                    "resolution": "10mi²",
                },
                headers={
                    "Authorization": f"Bearer {FORTYGUARD_API_KEY}",
                    "Content-Type": "application/json",
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Map FortyGuard response to our model
            return MockTemperatureData(
                location=data.get("location", location),
                temperature_f=float(data.get("temperature_f", 0)),
                risk_level=data.get("risk_level", "unknown"),
                resolution=data.get("resolution", "10mi²"),
                measured_at=data.get("measured_at", "2m above ground"),
                credits_remaining=data.get("credits_remaining", 0),
                humidity=float(data.get("humidity", 0)) if data.get("humidity") else None,
                heat_index=float(data.get("heat_index", 0)) if data.get("heat_index") else None
            )
            
        except httpx.HTTPStatusError as e:
            logger.error(f"FortyGuard API error: {e.response.status_code} - {e.response.text}")
            # Fallback to mock data
            return generate_mock_temperature_data(location)
        except Exception as e:
            logger.error(f"Error fetching from FortyGuard API: {e}")
            # Fallback to mock data
            return generate_mock_temperature_data(location)
```

### Step 4: Update Endpoints to Use Real Data

Modify the `/api/mock-heat-data` endpoint:

```python
@app.get("/api/mock-heat-data", response_model=MockTemperatureData, tags=["Track 01: Resilient Cities"])
async def get_heat_data(
    location: str = Query("Phoenix, AZ", description="Location for temperature data")
) -> MockTemperatureData:
    """
    Get temperature data for a location.
    Uses real FortyGuard API when available, falls back to mock data.
    """
    logger.info(f"Retrieving heat data for: {location}")
    
    if USE_MOCK_DATA:
        return generate_mock_temperature_data(location)
    else:
        return await fetch_real_temperature_data(location)
```

### Step 5: Install Required Dependencies

```bash
cd backend
pip install httpx
```

---

## 3. Frontend Configuration

### 📁 Location: `frontend/`

### Step 1: Update Environment Variables

Create or update the `.env.local` file in the `frontend/` directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FORTYGUARD_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

### Step 2: Update API Client

In `frontend/lib/api.ts`, ensure the base URL is configurable:

```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Add API key header if needed
    ...(process.env.NEXT_PUBLIC_FORTYGUARD_API_KEY && {
      'X-API-Key': process.env.NEXT_PUBLIC_FORTYGUARD_API_KEY
    })
  },
});
```

### Step 3: Update Hooks to Handle Real Data

No changes needed! The hooks in `frontend/hooks/useApi.ts` already work with both mock and real data since they use the same data structure.

---

## 4. Switching from Mock to Real Data

### ✅ Simple Switch Method

Just update your environment variables:

#### Backend
```bash
# backend/.env
USE_MOCK_DATA=false
FORTYGUARD_API_KEY=your_actual_key
```

#### Frontend
```bash
# frontend/.env.local
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

Then restart both servers:
```bash
# Terminal 1
cd backend
uvicorn main:app --reload

# Terminal 2
cd frontend
npm run dev
```

### ✅ Gradual Testing Method

Keep `USE_MOCK_DATA=true` initially and test with:

```python
# Temporarily in main.py
if USE_MOCK_DATA and os.getenv("FORCE_REAL_API"):
    return await fetch_real_temperature_data(location)
```

Then run with:
```bash
FORCE_REAL_API=true uvicorn main:app --reload
```

---

## 5. API Endpoint Mapping

### FortyGuard API → HeatGuard AI Endpoints

| FortyGuard Endpoint | HeatGuard Endpoint | Purpose |
|---|---|---|
| `/v1/temperature` | `/api/mock-heat-data` | Get temperature data |
| `/v1/temperature/map` | `/api/heat-map` | Get heat map data |
| `/v1/alerts` | `/api/emergency-alerts` | Get emergency alerts |
| N/A | `/api/route` | Plan safe routes |
| N/A | `/api/agent-query` | Query AI agent |

### Data Structure Mapping

#### FortyGuard Response → HeatGuard MockTemperatureData

```json
{
  "location": "Phoenix, AZ",           // ✅ Direct mapping
  "temperature_f": 112.5,             // ✅ Direct mapping
  "risk_level": "extreme",            // ✅ Direct mapping
  "resolution": "10mi²",              // ✅ Direct mapping
  "measured_at": "2m above ground",   // ✅ Direct mapping
  "credits_remaining": 999999,         // ✅ Direct mapping
  "humidity": 15.0,                   // ✅ Direct mapping
  "heat_index": 125.0                // ✅ Direct mapping
}
```

---

## 6. Testing the Integration

### Step 1: Test Backend First

```bash
cd backend
python -c "
import asyncio
from main import fetch_real_temperature_data

async def test():
    data = await fetch_real_temperature_data('Phoenix, AZ')
    print('Real API Data:', data)
    
asyncio.run(test())
"
```

Expected output:
```
Real API Data: location='Phoenix, AZ' temperature_f=112.0 risk_level='extreme' ...
```

### Step 2: Test API Endpoints

```bash
# Test temperature data endpoint
curl "http://localhost:8000/api/mock-heat-data?location=Phoenix,AZ"

# Test heat map endpoint
curl "http://localhost:8000/api/heat-map?location=Phoenix,AZ"
```

### Step 3: Test Frontend

Open your browser and navigate to `http://localhost:3000`
- Check if temperature displays correctly
- Verify map zones show real data
- Test AI agent queries with real data

---

## 7. Troubleshooting

### ❌ Common Issues

#### Issue 1: API Key Not Recognized
```
401 Unauthorized
```
**Solution:**
- Verify API key is in `.env` file (backend) and `.env.local` (frontend)
- Check for typos in the key
- Ensure the key is not exposed in version control

#### Issue 2: Rate Limit Exceeded
```
429 Too Many Requests
```
**Solution:**
- Check `credits_remaining` in response
- Implement caching in backend
- Reduce polling frequency in frontend

#### Issue 3: CORS Errors
```
CORS error when calling backend from frontend
```
**Solution:**
- Verify CORS middleware in `backend/main.py`
- Ensure frontend URL is in allowed origins
- Check if credentials are allowed

#### Issue 4: Connection Timeout
```
Connection timeout to FortyGuard API
```
**Solution:**
- Increase timeout in httpx client
- Check internet connection
- Verify FortyGuard API is accessible

#### Issue 5: Data Structure Mismatch
```
Validation error: field required
```
**Solution:**
- Compare FortyGuard response with expected structure
- Update data mapping in `fetch_real_temperature_data`
- Add fallback values for missing fields

### ✅ Error Handling Tips

1. **Always have fallbacks:** Keep mock data as fallback
2. **Log errors:** Use `logger.error()` for debugging
3. **Validate responses:** Check for required fields
4. **Test incrementally:** Test one endpoint at a time

---

## 📝 Checklist Before August 18

- [ ] Backend `/api/mock-heat-data` endpoint ready
- [ ] Backend `/api/heat-map` endpoint ready
- [ ] Backend `/api/zones` endpoint ready
- [ ] Backend `/api/emergency-alerts` endpoint ready
- [ ] `USE_MOCK_DATA` flag implemented
- [ ] `FORTYGUARD_API_KEY` environment variable configured
- [ ] httpx library installed in backend
- [ ] Error handling for API failures
- [ ] Fallback to mock data on errors
- [ ] Frontend environment variables configured

---

## 🎯 Checklist for August 18

- [ ] Obtain FortyGuard API key from organizers
- [ ] Add key to backend `.env` file
- [ ] Add key to frontend `.env.local` file
- [ ] Set `USE_MOCK_DATA=false`
- [ ] Test backend endpoints with real data
- [ ] Test frontend with real data
- [ ] Monitor API credit usage
- [ ] Implement rate limiting if needed
- [ ] Test all features (map, routes, AI agent)
- [ ] Verify production build works

---

## 🔧 Additional Configuration

### Caching (Recommended for Production)

```python
# backend/main.py
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

# Setup caching
FastAPICache.init(RedisBackend("redis://localhost"))

@cache(expire=300)  # Cache for 5 minutes
@app.get("/api/mock-heat-data")
async def get_heat_data(location: str = "Phoenix, AZ") -> MockTemperatureData:
    # ... existing code
```

### Rate Limiting (Recommended)

```python
# backend/main.py
from fastapi import Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/mock-heat-data")
@limiter.limit("10/minute")
async def get_heat_data(request: Request, location: str = "Phoenix, AZ") -> MockTemperatureData:
    # ... existing code
```

---

## 📞 Support

If you encounter issues during integration:

1. **Check the logs:** Look at console output for error messages
2. **Review this guide:** Most issues are covered above
3. **Test incrementally:** Isolate the problem to a specific endpoint
4. **Ask for help:** Contact your team members or hackathon organizers

---

## 🏆 Success Checklist

After successful integration, verify:

- [ ] Real temperature data displays in dashboard
- [ ] Heat zones show accurate temperatures
- [ ] Emergency locations have real data
- [ ] Route planning uses real temperature data
- [ ] AI agent provides recommendations based on real data
- [ ] No console errors in browser or backend
- [ ] API credits are being consumed appropriately

---

**Good luck! Your HeatGuard AI project is ready to win the FortyGuard Global AI Hackathon '26! 🏆**

*This integration guide was generated as part of the HeatGuard AI project for Track 01 + Track 06.*
