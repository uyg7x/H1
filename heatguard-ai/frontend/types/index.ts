// ============================================================================
// API Response Types
// ============================================================================

// Temperature Data Types
export interface TemperatureData {
  location: string;
  temperature_f: number;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
  resolution: string;
  measured_at: string;
  credits_remaining: number;
  humidity?: number;
  heat_index?: number;
}

export interface HeatZone {
  zone_id: string;
  name: string;
  polygon: number[][];
  avg_temperature_f: number;
  max_temperature_f: number;
  min_temperature_f: number;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
  resolution: string;
}

export interface RouteOption {
  route_name: string;
  avg_temperature: number;
  max_temperature: number;
  distance_km: number;
  estimated_time_min: number;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
  waypoints: number[][];
  temperature_profile?: number[];
}

export interface EmergencyLocation {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'fire_station' | 'police_station' | 'cooling_center';
  latitude: number;
  longitude: number;
  address?: string;
  temperature: number;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
  capacity?: number;
  contact?: string;
  hours?: string;
}

export interface HeatMapData {
  city_data: TemperatureData;
  route_options: RouteOption[];
  emergency_locations: EmergencyLocation[];
}

// Route Planning Types
export type RouteOptimization = 'safety' | 'speed' | 'balanced';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  temperature?: number;
  risk_level?: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
}

export interface RouteSegment {
  start: RoutePoint;
  end: RoutePoint;
  distance_km: number;
  avg_temperature: number;
  max_temperature: number;
  travel_time_min: number;
}

export interface PlannedRoute {
  route_id: string;
  start_location: string;
  end_location: string;
  start_coords: [number, number];
  end_coords: [number, number];
  segments: RouteSegment[];
  total_distance_km: number;
  total_time_min: number;
  avg_temperature: number;
  max_temperature: number;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme' | 'critical';
  optimization: RouteOptimization;
  alternative_routes: RouteOption[];
}

export interface RouteRequest {
  start_location: string;
  start_coords?: [number, number];
  end_location: string;
  end_coords?: [number, number];
  optimization: RouteOptimization;
  avoid_extreme?: boolean;
  max_temperature?: number;
}

// AI Agent Types
export type AgentAction = 'analyze' | 'recommend' | 'alert' | 'query' | 'find';

export interface AgentQuery {
  query: string;
  location?: string;
  context?: Record<string, any>;
  temperature?: number;
  risk_level?: string;
}

export interface AgentResponse {
  response_id: string;
  query: string;
  action: AgentAction;
  summary: string;
  detailed_response: string;
  data?: Record<string, any>;
  recommendations: string[];
  alerts: string[];
  timestamp: string;
  confidence: number;
}

export interface EmergencyAlert {
  alert_id: string;
  alert_type: string;
  severity: string;
  location: string;
  coordinates: [number, number];
  temperature: number;
  message: string;
  timestamp: string;
  actions: string[];
}

// API Response Wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// UI State Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  bounds?: MapBounds;
}

export interface UIState {
  selectedCity: string;
  selectedRoute?: PlannedRoute;
  selectedLocation?: EmergencyLocation;
  mapView: MapViewState;
  isChatOpen: boolean;
  isSidebarOpen: boolean;
}

// Leaflet Types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface LeafletLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

// Color Mapping
export const RISK_COLORS: Record<string, string> = {
  low: '#10b981',      // Green
  moderate: '#f59e0b', // Amber
  high: '#ea580c',    // Orange
  extreme: '#dc2626',  // Red
  critical: '#991b1b', // Dark Red
};

export const RISK_LABELS: Record<string, string> = {
  low: 'Safe',
  moderate: 'Caution',
  high: 'High Risk',
  extreme: 'Extreme Danger',
  critical: 'Critical',
};

// Health Check Response
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version?: string;
  uptime_seconds?: number;
  services?: Record<string, { status: 'up' | 'down'; latency_ms?: number }>;
  timestamp: string;
}

// Message Types for Chat
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    action?: AgentAction;
    confidence?: number;
    data?: any;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}
