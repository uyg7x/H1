"""
HeatGuard AI Backend - FastAPI Application
Main entry point for the HeatGuard AI service.
Combines Track 01 (Resilient Cities) and Track 06 (AI Agent Tools).
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import uuid
import random
import time
from datetime import datetime, timedelta
import logging

# Import models
from models import (
    MockTemperatureData,
    MockHeatMapData,
    AgentQuery,
    AgentResponse,
    AgentAction,
    RouteRequest,
    PlannedRoute,
    RouteOptimization,
    RiskLevel,
    EmergencyAlert,
    APIResponse,
    HealthCheckResponse,
    CityHeatData,
    HeatZone,
    TemperatureReading,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="HeatGuard AI API",
    description="Backend API for HeatGuard AI - Combining Resilient Cities (Track 01) and AI Agent Tools (Track 06)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration (allow frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track application start time for uptime calculation
START_TIME = time.time()


# ============================================================================
# Mock Data Generators
# ============================================================================

def generate_mock_temperature_data(location: str = "Phoenix, AZ") -> MockTemperatureData:
    """Generate realistic mock temperature data"""
    base_temp = random.uniform(105, 115)
    
    # Vary temperature based on location
    location_temps = {
        "Phoenix, AZ": 112.0,
        "Las Vegas, NV": 110.0,
        "Los Angeles, CA": 105.0,
        "Houston, TX": 108.0,
        "Miami, FL": 102.0,
        "New York, NY": 95.0,
        "Chicago, IL": 92.0,
        "Atlanta, GA": 100.0,
    }
    
    temperature = location_temps.get(location, base_temp)
    
    # Determine risk level based on temperature
    if temperature >= 110:
        risk_level = "extreme"
        humidity = random.uniform(10, 20)
    elif temperature >= 105:
        risk_level = "high"
        humidity = random.uniform(20, 35)
    elif temperature >= 100:
        risk_level = "moderate"
        humidity = random.uniform(35, 50)
    else:
        risk_level = "low"
        humidity = random.uniform(50, 70)
    
    # Calculate heat index approximation
    heat_index = temperature + (humidity * 0.1)
    
    return MockTemperatureData(
        location=location,
        temperature_f=round(temperature, 1),
        risk_level=risk_level,
        resolution="10mi²",
        measured_at="2m above ground",
        credits_remaining=999999,
        humidity=round(humidity, 1),
        heat_index=round(heat_index, 1)
    )


def generate_mock_heat_map_data(location: str = "Phoenix, AZ") -> MockHeatMapData:
    """Generate extended mock data with routes and emergency locations"""
    city_data = generate_mock_temperature_data(location)
    
    # Generate route options based on city
    route_options = []
    if location == "Phoenix, AZ":
        route_options = [
            {
                "route_name": "Downtown Phoenix",
                "avg_temperature": 110.5,
                "max_temperature": 115.0,
                "distance_km": 5.2,
                "estimated_time_min": 12,
                "risk_level": "extreme",
                "waypoints": [[33.4484, -112.0740], [33.4500, -112.0700], [33.4520, -112.0680]],
                "temperature_profile": [112.0, 114.0, 115.0, 113.0, 110.5]
            },
            {
                "route_name": "I-10 Highway",
                "avg_temperature": 108.0,
                "max_temperature": 112.0,
                "distance_km": 6.8,
                "estimated_time_min": 10,
                "risk_level": "high",
                "waypoints": [[33.4484, -112.0740], [33.4600, -112.0700], [33.4650, -112.0650]],
                "temperature_profile": [110.0, 112.0, 111.0, 108.0]
            },
            {
                "route_name": "Cooling Corridor",
                "avg_temperature": 102.0,
                "max_temperature": 106.0,
                "distance_km": 7.5,
                "estimated_time_min": 15,
                "risk_level": "moderate",
                "waypoints": [[33.4484, -112.0740], [33.4400, -112.0600], [33.4350, -112.0550]],
                "temperature_profile": [105.0, 104.0, 102.0, 100.0]
            }
        ]
    else:
        # Generic routes for other cities
        route_options = [
            {
                "route_name": "Primary Route",
                "avg_temperature": city_data.temperature_f - 2,
                "max_temperature": city_data.temperature_f,
                "distance_km": 5.0,
                "estimated_time_min": 10,
                "risk_level": city_data.risk_level,
                "waypoints": [[34.0, -118.0], [34.01, -118.01]],
                "temperature_profile": [city_data.temperature_f - 2, city_data.temperature_f]
            },
            {
                "route_name": "Alternate Route",
                "avg_temperature": city_data.temperature_f - 5,
                "max_temperature": city_data.temperature_f - 3,
                "distance_km": 6.0,
                "estimated_time_min": 12,
                "risk_level": "moderate" if city_data.risk_level == "extreme" else "low",
                "waypoints": [[34.0, -118.0], [34.02, -118.02]],
                "temperature_profile": [city_data.temperature_f - 5, city_data.temperature_f - 3]
            }
        ]
    
    # Generate emergency locations
    emergency_locations = []
    if location == "Phoenix, AZ":
        emergency_locations = [
            {
                "id": "hosp-001",
                "name": "Phoenix General Hospital",
                "type": "hospital",
                "latitude": 33.4500,
                "longitude": -112.0700,
                "address": "123 Main St, Phoenix, AZ",
                "temperature": city_data.temperature_f - 4,
                "risk_level": "high",
                "capacity": 500,
                "contact": "+1-555-0101"
            },
            {
                "id": "shelter-001",
                "name": "City Cooling Shelter - Downtown",
                "type": "cooling_center",
                "latitude": 33.4450,
                "longitude": -112.0650,
                "address": "456 Cool St, Phoenix, AZ",
                "temperature": city_data.temperature_f - 10,
                "risk_level": "low",
                "capacity": 200,
                "contact": "+1-555-0102",
                "hours": "8:00 AM - 8:00 PM"
            },
            {
                "id": "shelter-002",
                "name": "East Valley Cooling Center",
                "type": "cooling_center",
                "latitude": 33.4300,
                "longitude": -112.0500,
                "address": "789 Safe Ave, Phoenix, AZ",
                "temperature": city_data.temperature_f - 8,
                "risk_level": "low",
                "capacity": 150,
                "contact": "+1-555-0103",
                "hours": "9:00 AM - 6:00 PM"
            },
            {
                "id": "fire-001",
                "name": "Phoenix Fire Station #1",
                "type": "fire_station",
                "latitude": 33.4550,
                "longitude": -112.0800,
                "address": "101 Fire Ln, Phoenix, AZ",
                "temperature": city_data.temperature_f - 2,
                "risk_level": "high",
                "contact": "911"
            }
        ]
    else:
        emergency_locations = [
            {
                "id": "hosp-001",
                "name": f"{location.split(',')[0]} General Hospital",
                "type": "hospital",
                "latitude": 34.0,
                "longitude": -118.0,
                "address": f"123 Main St, {location}",
                "temperature": city_data.temperature_f - 4,
                "risk_level": "moderate",
                "capacity": 300
            },
            {
                "id": "shelter-001",
                "name": f"{location.split(',')[0]} Cooling Shelter",
                "type": "cooling_center",
                "latitude": 34.01,
                "longitude": -118.01,
                "address": f"456 Cool St, {location}",
                "temperature": city_data.temperature_f - 8,
                "risk_level": "low",
                "capacity": 150
            }
        ]
    
    return MockHeatMapData(
        city_data=city_data,
        route_options=route_options,
        emergency_locations=emergency_locations
    )


def generate_heat_zones(location: str = "Phoenix, AZ") -> List[HeatZone]:
    """Generate mock heat zones for a city"""
    zones = []
    base_temp = generate_mock_temperature_data(location).temperature_f
    
    if location == "Phoenix, AZ":
        zones = [
            HeatZone(
                zone_id="phx-downtown",
                name="Downtown Phoenix",
                polygon=[
                    [33.4484, -112.0740],
                    [33.4520, -112.0740],
                    [33.4520, -112.0680],
                    [33.4484, -112.0680],
                    [33.4484, -112.0740]
                ],
                avg_temperature_f=round(base_temp - 1, 1),
                max_temperature_f=round(base_temp + 3, 1),
                min_temperature_f=round(base_temp - 2, 1),
                risk_level=RiskLevel.EXTREME,
                resolution="1mi²"
            ),
            HeatZone(
                zone_id="phx-midtown",
                name="Midtown Phoenix",
                polygon=[
                    [33.4520, -112.0740],
                    [33.4600, -112.0740],
                    [33.4600, -112.0700],
                    [33.4520, -112.0700],
                    [33.4520, -112.0740]
                ],
                avg_temperature_f=round(base_temp - 2, 1),
                max_temperature_f=round(base_temp, 1),
                min_temperature_f=round(base_temp - 4, 1),
                risk_level=RiskLevel.HIGH,
                resolution="1mi²"
            ),
            HeatZone(
                zone_id="phx-suburbs",
                name="Phoenix Suburbs",
                polygon=[
                    [33.4300, -112.0800],
                    [33.4400, -112.0800],
                    [33.4400, -112.0600],
                    [33.4300, -112.0600],
                    [33.4300, -112.0800]
                ],
                avg_temperature_f=round(base_temp - 6, 1),
                max_temperature_f=round(base_temp - 4, 1),
                min_temperature_f=round(base_temp - 8, 1),
                risk_level=RiskLevel.MODERATE,
                resolution="2mi²"
            ),
            HeatZone(
                zone_id="phx-river",
                name="Salt River Area",
                polygon=[
                    [33.4600, -112.0700],
                    [33.4700, -112.0700],
                    [33.4700, -112.0500],
                    [33.4600, -112.0500],
                    [33.4600, -112.0700]
                ],
                avg_temperature_f=round(base_temp - 10, 1),
                max_temperature_f=round(base_temp - 8, 1),
                min_temperature_f=round(base_temp - 12, 1),
                risk_level=RiskLevel.LOW,
                resolution="3mi²"
            )
        ]
    else:
        # Generic zones for other cities
        for i in range(4):
            zones.append(
                HeatZone(
                    zone_id=f"{location.replace(', ', '-').replace(' ', '-').lower()}-zone-{i}",
                    name=f"Zone {i+1}",
                    polygon=[
                        [34.0 + (i * 0.01), -118.0 + (i * 0.01)],
                        [34.0 + (i * 0.01), -118.0 - (i * 0.01)],
                        [34.0 - (i * 0.01), -118.0 - (i * 0.01)],
                        [34.0 - (i * 0.01), -118.0 + (i * 0.01)],
                        [34.0 + (i * 0.01), -118.0 + (i * 0.01)]
                    ],
                    avg_temperature_f=round(base_temp - (i * 3), 1),
                    max_temperature_f=round(base_temp - (i * 2), 1),
                    min_temperature_f=round(base_temp - (i * 4), 1),
                    risk_level=[RiskLevel.EXTREME, RiskLevel.HIGH, RiskLevel.MODERATE, RiskLevel.LOW][i],
                    resolution="2mi²"
                )
            )
    
    return zones


# ============================================================================
# AI Agent Logic (Rule-Based)
# ============================================================================

def analyze_temperature_risk(temperature: float, risk_level: str) -> List[str]:
    """Generate recommendations based on temperature and risk level"""
    recommendations = []
    
    if risk_level == "extreme" or temperature >= 110:
        recommendations.extend([
            "ISSUE EXTREME HEAT WARNING - Avoid outdoor activities",
            "Activate emergency cooling centers immediately",
            "Deploy mobile hydration units",
            "Increase police and EMS patrols in high-risk areas",
            "Monitor vulnerable populations (elderly, homeless)",
            "Consider closing schools and non-essential businesses"
        ])
    elif risk_level == "high" or temperature >= 105:
        recommendations.extend([
            "ISSUE HEAT ADVISORY - Limit outdoor activities",
            "Open cooling centers",
            "Encourage hydration and shade use",
            "Monitor at-risk individuals",
            "Prepare for potential escalation to extreme"
        ])
    elif risk_level == "moderate" or temperature >= 100:
        recommendations.extend([
            "Recommend caution for outdoor activities",
            "Ensure cooling centers are staffed and ready",
            "Distribute heat safety information",
            "Monitor weather forecasts for changes"
        ])
    else:
        recommendations.extend([
            "Normal operations - continue monitoring",
            "Maintain standard cooling center hours",
            "No immediate action required"
        ])
    
    return recommendations


def find_emergency_locations_in_zones(heat_map_data: MockHeatMapData, location_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Find emergency locations in high-risk zones"""
    high_risk_zones = [z for z in heat_map_data.emergency_locations if z.get("risk_level") in ["extreme", "high"]]
    
    if location_type:
        high_risk_zones = [z for z in high_risk_zones if z.get("type") == location_type]
    
    return high_risk_zones


def generate_agent_response(query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
    """
    Rule-based AI agent that analyzes queries and provides responses.
    This will be replaced with LLM integration when API key is available.
    """
    query_lower = query.lower()
    
    # Extract context
    temperature = context.get("temperature", 112.0) if context else 112.0
    risk_level = context.get("risk_level", "extreme") if context else "extreme"
    location = context.get("location", "Phoenix, AZ") if context else "Phoenix, AZ"
    heat_map_data = context.get("heat_map_data")
    
    # Determine action type
    if any(word in query_lower for word in ["find", "locate", "where", "list"]):
        action = AgentAction.FIND
    elif any(word in query_lower for word in ["alert", "warning", "emergency", "danger"]):
        action = AgentAction.ALERT
    elif any(word in query_lower for word in ["recommend", "suggest", "advice", "should"]):
        action = AgentAction.RECOMMEND
    elif any(word in query_lower for word in ["analyze", "explain", "why", "what"]):
        action = AgentAction.ANALYZE
    else:
        action = AgentAction.QUERY
    
    # Generate response based on query type
    response_id = f"resp-{uuid.uuid4().hex[:8]}"
    
    # Predefined query patterns
    if "hospital" in query_lower or "hospitals" in query_lower:
        if heat_map_data:
            hospitals = [e for e in heat_map_data.emergency_locations if e.get("type") == "hospital"]
            hospital_names = [h["name"] for h in hospitals]
            temperatures = [h["temperature"] for h in hospitals]
            
            return AgentResponse(
                response_id=response_id,
                query=query,
                action=action,
                summary=f"Found {len(hospitals)} hospitals in {location}",
                detailed_response=f"I found {len(hospitals)} hospitals in {location}: {', '.join(hospital_names)}. "
                    f"Current temperatures at these locations range from {min(temperatures)}°F to {max(temperatures)}°F. "
                    f"Given the current risk level ({risk_level}), I recommend prioritizing hospitals in lower temperature zones.",
                data={"hospitals": hospitals, "count": len(hospitals)},
                recommendations=[
                    f"Direct emergency vehicles to {'the coolest hospital' if hospitals else 'nearest medical facility'}",
                    "Monitor hospital capacity in high-temperature zones"
                ],
                alerts=[f"HIGH TEMPERATURE ALERT: Hospitals experiencing {max(temperatures)}°F"],
                confidence=0.95
            )
    
    elif "cooling center" in query_lower or "shelter" in query_lower or "cooling" in query_lower:
        if heat_map_data:
            shelters = [e for e in heat_map_data.emergency_locations if e.get("type") == "cooling_center"]
            shelter_names = [s["name"] for s in shelters]
            temperatures = [s["temperature"] for s in shelters]
            
            return AgentResponse(
                response_id=response_id,
                query=query,
                action=action,
                summary=f"Found {len(shelters)} cooling centers in {location}",
                detailed_response=f"I identified {len(shelters)} cooling centers in {location}: {', '.join(shelter_names)}. "
                    f"Temperatures at these facilities range from {min(temperatures)}°F to {max(temperatures)}°F. "
                    f"With the current risk level at '{risk_level}', all cooling centers should be activated immediately.",
                data={"cooling_centers": shelters, "count": len(shelters)},
                recommendations=[
                    "Activate all cooling centers immediately",
                    "Extend operating hours if risk level is extreme",
                    f"Direct residents to {shelter_names[0] if shelters else 'nearest cooling center'}"
                ],
                alerts=[f"EMERGENCY: Cooling centers needed - Current risk: {risk_level}" if risk_level in ["extreme", "high"] else None],
                confidence=0.98
            )
    
    elif "route" in query_lower or "path" in query_lower or "navigation" in query_lower:
        if heat_map_data:
            safest_route = min(heat_map_data.route_options, key=lambda x: x.get("avg_temperature", 200))
            
            return AgentResponse(
                response_id=response_id,
                query=query,
                action=action,
                summary=f"Recommended safest route: {safest_route['route_name']}",
                detailed_response=f"Based on current temperature data, I recommend the **{safest_route['route_name']}** as the safest route. "
                    f"This route has an average temperature of {safest_route['avg_temperature']}°F "
                    f"(maximum: {safest_route['max_temperature']}°F) and will take approximately {safest_route['estimated_time_min']} minutes. "
                    f"Risk level: {safest_route['risk_level']}. "
                    f"Always carry water and check for updates before departure.",
                data={"recommended_route": safest_route, "alternatives": heat_map_data.route_options},
                recommendations=[
                    f"Take the {safest_route['route_name']} for lowest heat exposure",
                    "Travel during early morning or late evening when temperatures are lower",
                    "Bring plenty of water and wear sun protection"
                ],
                alerts=[f"CAUTION: Route temperatures reaching {safest_route['max_temperature']}°F"],
                confidence=0.96
            )
    
    elif "extreme" in query_lower or "high risk" in query_lower or "danger" in query_lower:
        recommendations = analyze_temperature_risk(temperature, risk_level)
        
        return AgentResponse(
                response_id=response_id,
                query=query,
                action=AgentAction.ALERT,
                summary=f"Extreme heat alert for {location} - Temperature: {temperature}°F",
                detailed_response=f"**CRITICAL ALERT**: {location} is experiencing {risk_level.upper()} heat conditions "
                    f"with a temperature of {temperature}°F. This is a life-threatening situation. "
                    f"Immediate actions are required to protect public health. "
                    f"The following measures should be implemented: {', '.join(recommendations[:3])}.",
                data={
                    "temperature": temperature,
                    "risk_level": risk_level,
                    "location": location,
                    "recommendations": recommendations
                },
                recommendations=recommendations,
                alerts=[
                    f"EMERGENCY ALERT: {location} at {temperature}°F ({risk_level.upper()})",
                    "Activate emergency response protocols",
                    "Evacuate vulnerable populations from extreme zones"
                ],
                confidence=1.0
            )
    
    elif "analyze" in query_lower or "what is" in query_lower or "explain" in query_lower:
        return AgentResponse(
            response_id=response_id,
            query=query,
            action=AgentAction.ANALYZE,
            summary=f"Temperature analysis for {location}",
            detailed_response=f"Current conditions in {location}: Temperature is {temperature}°F with a "
                f"{risk_level.upper()} risk level. This means that outdoor activities pose "
                f"{'severe' if risk_level in ['extreme', 'critical'] else 'significant' if risk_level == 'high' else 'moderate'} "
                f"health risks, especially for vulnerable populations. "
                f"Heat index (feels-like temperature) is approximately {temperature + (temperature * 0.05)}°F. "
                f"The situation {'requires immediate action' if risk_level in ['extreme', 'critical'] else 'should be monitored closely'}. "
                f"Check cooling centers and emergency services readiness.",
            data={
                "location": location,
                "temperature": temperature,
                "risk_level": risk_level,
                "estimated_heat_index": round(temperature + (temperature * 0.05), 1)
            },
            recommendations=analyze_temperature_risk(temperature, risk_level)[:3],
            confidence=0.92
        )
    
    else:
        # Generic response
        recommendations = analyze_temperature_risk(temperature, risk_level)
        
        return AgentResponse(
            response_id=response_id,
            query=query,
            action=AgentAction.QUERY,
            summary=f"HeatGuard AI response for {location}",
            detailed_response=f"I'm HeatGuard AI, your autonomous heat analysis assistant. "
                f"Current conditions in {location}: {temperature}°F with {risk_level} risk. "
                f"I can help you with: finding cooling centers, analyzing temperature data, "
                f"recommending safe routes, and identifying emergency locations. "
                f"Please ask a specific question for detailed assistance.",
            data={
                "location": location,
                "temperature": temperature,
                "risk_level": risk_level,
                "available_commands": ["find hospitals", "find cooling centers", "analyze temperature", "recommend route", "emergency locations"]
            },
            recommendations=recommendations[:2],
            confidence=0.85
        )


# ============================================================================
# Route Planning Logic
# ============================================================================

def calculate_safest_route(request: RouteRequest) -> PlannedRoute:
    """Calculate the safest route based on temperature data"""
    route_id = f"route-{uuid.uuid4().hex[:8]}"
    
    # Generate mock route based on request
    start_lat = request.start_coords[0] if request.start_coords else 33.4484
    start_lon = request.start_coords[1] if request.start_coords else -112.0740
    end_lat = request.end_coords[0] if request.end_coords else 33.4550
    end_lon = request.end_coords[1] if request.end_coords else -112.0650
    
    # Simulate temperature along route
    base_temp = generate_mock_temperature_data(request.start_location).temperature_f
    
    # Adjust based on optimization strategy
    if request.optimization == RouteOptimization.SAFETY:
        avg_temp = base_temp - 8
        max_temp = base_temp - 5
        distance_km = 7.0
        time_min = 15
        risk = RiskLevel.MODERATE
    elif request.optimization == RouteOptimization.SPEED:
        avg_temp = base_temp - 2
        max_temp = base_temp
        distance_km = 5.0
        time_min = 8
        risk = RiskLevel.HIGH if base_temp >= 105 else RiskLevel.MODERATE
    else:  # BALANCED
        avg_temp = base_temp - 4
        max_temp = base_temp - 2
        distance_km = 6.0
        time_min = 10
        risk = RiskLevel.MODERATE
    
    # Create segments
    segments = [
        {
            "start": {
                "latitude": start_lat,
                "longitude": start_lon,
                "temperature": avg_temp,
                "risk_level": risk
            },
            "end": {
                "latitude": (start_lat + end_lat) / 2,
                "longitude": (start_lon + end_lon) / 2,
                "temperature": avg_temp + 1,
                "risk_level": risk
            },
            "distance_km": distance_km / 2,
            "avg_temperature": avg_temp,
            "max_temperature": max_temp,
            "travel_time_min": time_min / 2
        },
        {
            "start": {
                "latitude": (start_lat + end_lat) / 2,
                "longitude": (start_lon + end_lon) / 2,
                "temperature": avg_temp + 1,
                "risk_level": risk
            },
            "end": {
                "latitude": end_lat,
                "longitude": end_lon,
                "temperature": avg_temp - 1,
                "risk_level": risk
            },
            "distance_km": distance_km / 2,
            "avg_temperature": avg_temp,
            "max_temperature": max_temp,
            "travel_time_min": time_min / 2
        }
    ]
    
    # Create alternative routes
    alternatives = []
    for i in range(2):
        alt_temp = base_temp - (10 + (i * 3))
        alternatives.append({
            "route_name": f"Alternative Route {i+1}",
            "avg_temperature": round(alt_temp, 1),
            "max_temperature": round(alt_temp + 3, 1),
            "distance_km": round(distance_km + (i * 1.5), 1),
            "estimated_time_min": round(time_min + (i * 3), 1),
            "risk_level": "low" if alt_temp < 95 else "moderate"
        })
    
    return PlannedRoute(
        route_id=route_id,
        start_location=request.start_location,
        end_location=request.end_location,
        start_coords=[start_lat, start_lon],
        end_coords=[end_lat, end_lon],
        segments=segments,
        total_distance_km=distance_km,
        total_time_min=time_min,
        avg_temperature=avg_temp,
        max_temperature=max_temp,
        risk_level=risk,
        optimization=request.optimization,
        alternative_routes=alternatives
    )


# ============================================================================
# Emergency Alert Logic
# ============================================================================

def check_for_emergencies(location: str = "Phoenix, AZ") -> List[EmergencyAlert]:
    """Check for emergency conditions and generate alerts"""
    data = generate_mock_temperature_data(location)
    alerts = []
    
    if data.risk_level in ["extreme", "critical"]:
        alerts.append(EmergencyAlert(
            alert_id=f"alert-{uuid.uuid4().hex[:8]}",
            alert_type="Extreme Heat",
            severity="CRITICAL",
            location=location,
            coordinates=[33.4484, -112.0740],  # Default Phoenix coords
            temperature=data.temperature_f,
            message=f"CRITICAL: {location} experiencing {data.risk_level.upper()} heat - {data.temperature_f}°F",
            timestamp=datetime.utcnow(),
            actions=[
                "Activate all cooling centers",
                "Deploy emergency services",
                "Issue public safety alert",
                "Monitor vulnerable populations"
            ]
        ))
    
    elif data.risk_level == "high":
        alerts.append(EmergencyAlert(
            alert_id=f"alert-{uuid.uuid4().hex[:8]}",
            alert_type="Heat Advisory",
            severity="HIGH",
            location=location,
            coordinates=[33.4484, -112.0740],
            temperature=data.temperature_f,
            message=f"ADVISORY: {location} under heat advisory - {data.temperature_f}°F",
            timestamp=datetime.utcnow(),
            actions=[
                "Open cooling centers",
                "Limit outdoor activities",
                "Increase water distribution"
            ]
        ))
    
    return alerts


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["General"])
async def root():
    """Root endpoint - service information"""
    return JSONResponse(
        status_code=200,
        content={
            "service": "HeatGuard AI API",
            "version": "1.0.0",
            "status": "running",
            "documentation": "/docs",
            "endpoints": {
                "mock_data": "/api/mock-heat-data",
                "heat_map": "/api/heat-map",
                "agent_query": "/api/agent-query",
                "plan_route": "/api/route",
                "emergency_alerts": "/api/emergency-alerts",
                "health": "/health"
            },
            "description": "Combining Track 01 (Resilient Cities) and Track 06 (AI Agent Tools) for FortyGuard Hackathon"
        }
    )


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - START_TIME
    return HealthCheckResponse(
        status="healthy",
        version="1.0.0",
        uptime=round(uptime, 2),
        timestamp=datetime.utcnow()
    )


# Track 01: Resilient Cities Endpoints
@app.get("/api/mock-heat-data", response_model=MockTemperatureData, tags=["Track 01: Resilient Cities"])
async def get_mock_heat_data(
    location: str = Query("Phoenix, AZ", description="Location for temperature data")
) -> MockTemperatureData:
    """
    Get mock temperature data for a location.
    This endpoint returns data matching the FortyGuard API structure.
    
    **Use this for development until August 18 when real API key is available.**
    """
    logger.info(f"Retrieving mock heat data for: {location}")
    return generate_mock_temperature_data(location)


@app.get("/api/heat-map", tags=["Track 01: Resilient Cities"])
async def get_heat_map_data(
    location: str = Query("Phoenix, AZ", description="Location for heat map data")
) -> MockHeatMapData:
    """
    Get extended mock heat map data including routes and emergency locations.
    This provides all the data needed for the frontend map visualization.
    """
    logger.info(f"Retrieving heat map data for: {location}")
    return generate_mock_heat_map_data(location)


@app.get("/api/zones", tags=["Track 01: Resilient Cities"])
async def get_heat_zones(
    location: str = Query("Phoenix, AZ", description="Location for zone data")
) -> List[HeatZone]:
    """
    Get heat zone polygons for map visualization.
    Each zone contains temperature data and risk level.
    """
    logger.info(f"Retrieving heat zones for: {location}")
    return generate_heat_zones(location)


@app.post("/api/route", response_model=PlannedRoute, tags=["Track 01: Resilient Cities"])
async def plan_route(route_request: RouteRequest) -> PlannedRoute:
    """
    Calculate the safest route between two locations based on temperature data.
    
    This endpoint takes start and end locations and returns the optimal route
    considering temperature, risk levels, and the requested optimization strategy.
    """
    logger.info(f"Planning route from {route_request.start_location} to {route_request.end_location}")
    return calculate_safest_route(route_request)


@app.get("/api/emergency-alerts", tags=["Track 01: Resilient Cities"])
async def get_emergency_alerts(
    location: str = Query("Phoenix, AZ", description="Location to check for emergencies")
) -> List[EmergencyAlert]:
    """
    Get current emergency alerts for a location.
    Returns critical alerts that require immediate attention.
    """
    logger.info(f"Checking for emergency alerts in: {location}")
    return check_for_emergencies(location)


# Track 06: AI Agent Endpoints
@app.post("/api/agent-query", response_model=AgentResponse, tags=["Track 06: AI Agent Tools"])
async def agent_query(agent_query: AgentQuery) -> AgentResponse:
    """
    Query the AI agent with natural language.
    
    The agent analyzes the query in the context of temperature data and provides:
    - Data-driven recommendations
    - Emergency alerts
    - Route suggestions
    - Location analysis
    
    **Example queries:**
    - "Find all hospitals in extreme heat zones"
    - "What is the safest route from downtown to the hospital?"
    - "Analyze the temperature data for Phoenix"
    - "Are there cooling centers open near me?"
    
    This uses rule-based logic for now and will integrate with LLM on August 18.
    """
    logger.info(f"Processing agent query: {agent_query.query}")
    
    # Add heat map data to context if location is provided
    context = agent_query.dict(exclude={"query"})
    if agent_query.location:
        context["heat_map_data"] = generate_mock_heat_map_data(agent_query.location)
        context["temperature"] = context["heat_map_data"].city_data.temperature_f
        context["risk_level"] = context["heat_map_data"].city_data.risk_level
    
    return generate_agent_response(agent_query.query, context)


@app.post("/api/agent-analyze", tags=["Track 06: AI Agent Tools"])
async def agent_analyze(
    query: str = Query(..., description="Analysis query"),
    location: str = Query("Phoenix, AZ", description="Location for analysis")
) -> Dict[str, Any]:
    """
    Alternative endpoint for agent analysis with query parameters.
    Useful for simple queries without full AgentQuery model.
    """
    logger.info(f"Agent analysis: {query} for {location}")
    
    heat_map_data = generate_mock_heat_map_data(location)
    context = {
        "location": location,
        "temperature": heat_map_data.city_data.temperature_f,
        "risk_level": heat_map_data.city_data.risk_level,
        "heat_map_data": heat_map_data
    }
    
    response = generate_agent_response(query, context)
    return response.dict()


# ============================================================================
# Utility Endpoints
# ============================================================================

@app.get("/api/cities", tags=["Utilities"])
async def get_available_cities() -> List[str]:
    """Get list of cities with mock data available"""
    return [
        "Phoenix, AZ",
        "Las Vegas, NV",
        "Los Angeles, CA",
        "Houston, TX",
        "Miami, FL",
        "New York, NY",
        "Chicago, IL",
        "Atlanta, GA",
        "Dallas, TX",
        "San Antonio, TX"
    ]


@app.get("/api/statistics", tags=["Utilities"])
async def get_statistics(
    location: str = Query("Phoenix, AZ", description="Location for statistics")
) -> Dict[str, Any]:
    """Get comprehensive statistics for a location"""
    heat_map_data = generate_mock_heat_map_data(location)
    
    return {
        "location": location,
        "overall_temperature": heat_map_data.city_data.temperature_f,
        "risk_level": heat_map_data.city_data.risk_level,
        "humidity": heat_map_data.city_data.humidity,
        "heat_index": heat_map_data.city_data.heat_index,
        "route_count": len(heat_map_data.route_options),
        "emergency_locations_count": len(heat_map_data.emergency_locations),
        "emergency_location_types": list(set(
            [e["type"] for e in heat_map_data.emergency_locations]
        )),
        "temperature_range": {
            "min": min(r["avg_temperature"] for r in heat_map_data.route_options),
            "max": max(r["max_temperature"] for r in heat_map_data.route_options)
        }
    }


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom error handler for HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse(
            success=False,
            error=str(exc.detail),
            timestamp=datetime.utcnow()
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content=APIResponse(
            success=False,
            error="Internal server error",
            message=str(exc),
            timestamp=datetime.utcnow()
        ).dict()
    )


# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    logger.info("Starting HeatGuard AI Backend...")
    logger.info("Backend will be available at http://localhost:8001 (localhost-only)")
    logger.info("API Documentation: http://localhost:8001/docs")

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info",
    )
