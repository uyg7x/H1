"""
Pydantic models for HeatGuard AI Backend
Defines data structures for temperature data, routes, and agent responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# Enums for standardized values
class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    EXTREME = "extreme"
    CRITICAL = "critical"


class RouteOptimization(str, Enum):
    SAFETY = "safety"  # Prioritize lowest temperature
    SPEED = "speed"    # Fastest route
    BALANCED = "balanced"  # Balance between safety and speed


class LocationType(str, Enum):
    HOSPITAL = "hospital"
    SHELTER = "shelter"
    FIRE_STATION = "fire_station"
    POLICE_STATION = "police_station"
    COOLING_CENTER = "cooling_center"


# ============================================================================
# Temperature Data Models
# ============================================================================

class TemperatureReading(BaseModel):
    """Single temperature reading at a specific location"""
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    temperature_f: float = Field(..., description="Temperature in Fahrenheit")
    temperature_c: Optional[float] = Field(None, description="Temperature in Celsius")
    risk_level: RiskLevel = Field(..., description="Heat risk level")
    measured_at: str = Field("2m above ground", description="Measurement height")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When measurement was taken")


class HeatZone(BaseModel):
    """Defines a geographic zone with temperature data"""
    zone_id: str = Field(..., description="Unique identifier for this zone")
    name: str = Field(..., description="Human-readable name")
    polygon: List[List[float]] = Field(..., description="Polygon coordinates [[lat, lon], ...]")
    avg_temperature_f: float = Field(..., description="Average temperature in zone")
    max_temperature_f: float = Field(..., description="Maximum temperature in zone")
    min_temperature_f: float = Field(..., description="Minimum temperature in zone")
    risk_level: RiskLevel = Field(..., description="Overall risk level for zone")
    resolution: str = Field("10mi²", description="Data resolution")


class CityHeatData(BaseModel):
    """Complete heat data for a city"""
    location: str = Field(..., description="City name, e.g., 'Phoenix, AZ'")
    overall_temperature_f: float = Field(..., description="Overall city temperature")
    overall_risk_level: RiskLevel = Field(..., description="Overall city risk level")
    zones: List[HeatZone] = Field(default_factory=list, description="Individual heat zones")
    measured_at: str = Field("2m above ground", description="Measurement height")
    credits_remaining: int = Field(999999, description="API credits remaining")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Data timestamp")


# ============================================================================
# Mock Data Models
# ============================================================================

class MockTemperatureData(BaseModel):
    """Mock temperature data structure matching FortyGuard API"""
    location: str = Field(default="Phoenix, AZ", description="Location name")
    temperature_f: float = Field(default=112.0, description="Temperature in Fahrenheit")
    risk_level: str = Field(default="extreme", description="Risk level")
    resolution: str = Field(default="10mi²", description="Data resolution")
    measured_at: str = Field(default="2m above ground", description="Measurement height")
    credits_remaining: int = Field(default=999999, description="Remaining API credits")
    humidity: Optional[float] = Field(default=15.0, description="Humidity percentage")
    heat_index: Optional[float] = Field(default=None, description="Calculated heat index")
    
    class Config:
        json_schema_extra = {
            "example": {
                "location": "Phoenix, AZ",
                "temperature_f": 112,
                "risk_level": "extreme",
                "resolution": "10mi²",
                "measured_at": "2m above ground",
                "credits_remaining": 999999,
                "humidity": 15.0,
                "heat_index": 125.0
            }
        }


class MockHeatMapData(BaseModel):
    """Extended mock data with route information"""
    city_data: MockTemperatureData = Field(..., description="Base temperature data")
    route_options: List[Dict[str, Any]] = Field(
        default_factory=lambda: [
            {
                "route_name": "Downtown Route",
                "avg_temperature": 110.5,
                "max_temperature": 115.0,
                "distance_km": 5.2,
                "estimated_time_min": 12,
                "risk_level": "extreme",
                "waypoints": [[33.4484, -112.0740], [33.4500, -112.0700]]
            },
            {
                "route_name": "Highway Route",
                "avg_temperature": 108.0,
                "max_temperature": 112.0,
                "distance_km": 6.8,
                "estimated_time_min": 10,
                "risk_level": "high",
                "waypoints": [[33.4484, -112.0740], [33.4600, -112.0700]]
            },
            {
                "route_name": "Cooling Route",
                "avg_temperature": 102.0,
                "max_temperature": 106.0,
                "distance_km": 7.5,
                "estimated_time_min": 15,
                "risk_level": "moderate",
                "waypoints": [[33.4484, -112.0740], [33.4400, -112.0600]]
            }
        ],
        description="Available route options with temperature data"
    )
    emergency_locations: List[Dict[str, Any]] = Field(
        default_factory=lambda: [
            {
                "name": "Phoenix General Hospital",
                "type": "hospital",
                "latitude": 33.4500,
                "longitude": -112.0700,
                "temperature": 108.0,
                "risk_level": "high"
            },
            {
                "name": "City Cooling Shelter",
                "type": "cooling_center",
                "latitude": 33.4450,
                "longitude": -112.0650,
                "temperature": 98.0,
                "risk_level": "low"
            }
        ],
        description="Emergency locations in the area"
    )


# ============================================================================
# Route Planning Models
# ============================================================================

class RoutePoint(BaseModel):
    """A single point in a route"""
    latitude: float = Field(..., description="Latitude")
    longitude: float = Field(..., description="Longitude")
    temperature: Optional[float] = Field(None, description="Temperature at this point")
    risk_level: Optional[RiskLevel] = Field(None, description="Risk level at this point")


class RouteSegment(BaseModel):
    """A segment between two points"""
    start: RoutePoint = Field(..., description="Starting point")
    end: RoutePoint = Field(..., description="Ending point")
    distance_km: float = Field(..., description="Distance in kilometers")
    avg_temperature: float = Field(..., description="Average temperature along segment")
    max_temperature: float = Field(..., description="Maximum temperature along segment")
    travel_time_min: float = Field(..., description="Estimated travel time in minutes")


class PlannedRoute(BaseModel):
    """Complete route plan with temperature considerations"""
    route_id: str = Field(..., description="Unique route identifier")
    start_location: str = Field(..., description="Start location name")
    end_location: str = Field(..., description="End location name")
    start_coords: List[float] = Field(..., description="[lat, lon] of start")
    end_coords: List[float] = Field(..., description="[lat, lon] of end")
    segments: List[RouteSegment] = Field(..., description="Route segments")
    total_distance_km: float = Field(..., description="Total distance")
    total_time_min: float = Field(..., description="Total estimated time")
    avg_temperature: float = Field(..., description="Average temperature along route")
    max_temperature: float = Field(..., description="Maximum temperature along route")
    risk_level: RiskLevel = Field(..., description="Overall route risk level")
    optimization: RouteOptimization = Field(..., description="Optimization strategy used")
    alternative_routes: List[Dict[str, Any]] = Field(default_factory=list, description="Alternative route options")


class RouteRequest(BaseModel):
    """Request to plan a route"""
    start_location: str = Field(..., description="Start location address or name")
    start_coords: Optional[List[float]] = Field(None, description="[lat, lon] of start (optional)")
    end_location: str = Field(..., description="End location address or name")
    end_coords: Optional[List[float]] = Field(None, description="[lat, lon] of end (optional)")
    optimization: RouteOptimization = Field(RouteOptimization.SAFETY, description="Optimization strategy")
    avoid_extreme: bool = Field(default=True, description="Avoid extreme heat zones")
    max_temperature: Optional[float] = Field(None, description="Maximum acceptable temperature")


# ============================================================================
# AI Agent Models
# ============================================================================

class AgentQuery(BaseModel):
    """Query for the AI agent"""
    query: str = Field(..., description="Natural language query")
    location: Optional[str] = Field(None, description="Location context")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context data")
    temperature: Optional[float] = Field(None, description="Current temperature context")
    risk_level: Optional[str] = Field(None, description="Current risk level context")


class AgentAction(str, Enum):
    ANALYZE = "analyze"
    RECOMMEND = "recommend"
    ALERT = "alert"
    QUERY = "query"
    FIND = "find"


class AgentResponse(BaseModel):
    """Response from the AI agent"""
    response_id: str = Field(..., description="Unique response identifier")
    query: str = Field(..., description="Original query")
    action: AgentAction = Field(..., description="Type of action performed")
    summary: str = Field(..., description="Brief summary of the response")
    detailed_response: str = Field(..., description="Detailed natural language response")
    data: Optional[Dict[str, Any]] = Field(None, description="Structured data from analysis")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations")
    alerts: List[str] = Field(default_factory=list, description="Critical alerts or warnings")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    confidence: float = Field(default=0.0, description="Confidence score (0-1)")


class EmergencyAlert(BaseModel):
    """Emergency alert structure"""
    alert_id: str = Field(..., description="Unique alert identifier")
    alert_type: str = Field(..., description="Type of emergency")
    severity: str = Field(..., description="Severity level")
    location: str = Field(..., description="Location of emergency")
    coordinates: List[float] = Field(..., description="[lat, lon] coordinates")
    temperature: float = Field(..., description="Temperature at location")
    message: str = Field(..., description="Alert message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Alert timestamp")
    actions: List[str] = Field(default_factory=list, description="Recommended actions")


# ============================================================================
# API Response Models
# ============================================================================

class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool = Field(..., description="Whether the request succeeded")
    data: Optional[Any] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Response message")
    error: Optional[str] = Field(None, description="Error message if failed")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class HealthCheckResponse(BaseModel):
    """Health check endpoint response"""
    status: str = Field(default="healthy", description="Service status")
    version: str = Field(default="1.0.0", description="API version")
    uptime: Optional[float] = Field(None, description="Service uptime in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
