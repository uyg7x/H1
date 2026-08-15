// ==========================================================================
// HeatGuard AI - TypeScript Interfaces
// Production-grade types for the FortyGuard Global AI Hackathon '26
// ==========================================================================

// ==========================================================================
// Core Data Types
// ==========================================================================

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface HeatZone {
  id: string;
  name: string;
  polygon: Coordinate[];
  avg_temperature_f: number;
  risk_level: RiskLevel;
  population: number;
  area_km2: number;
}

export interface EmergencyLocation {
  id: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police_station' | 'cooling_center';
  latitude: number;
  longitude: number;
  temperature: number;
  capacity: string;
  address: string;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
}

export interface PlannedRoute {
  id: string;
  name: string;
  waypoints: RouteWaypoint[];
  distance_km: number;
  duration_minutes: number;
  avg_temperature: number;
  risk_level: RiskLevel;
  route_type: 'fast' | 'cool';
}

// ==========================================================================
// Temperature & Risk Types
// ==========================================================================

export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface TemperatureData {
  location: string;
  temperature_f: number;
  temperature_c: number;
  risk_level: RiskLevel;
  humidity: number;
  heat_index: number;
  measured_at: string;
  resolution: string;
  credits_remaining: number;
  timestamp: string;
}

export interface ZoneTemperatureData {
  zone: HeatZone;
  current_temp: number;
  forecast: HourlyForecast[];
  historical: DailyTemperature[];
}

// ==========================================================================
// Forecast & Historical Data
// ==========================================================================

export interface HourlyForecast {
  hour: string;
  temperature_f: number;
  risk_level: RiskLevel;
  timestamp: string;
}

export interface DailyTemperature {
  date: string;
  avg_temp: number;
  max_temp: number;
  min_temp: number;
  risk_level: RiskLevel;
}

export interface WeeklyTrend {
  day: string;
  avg_temp: number;
  peak_temp: number;
  risk_level: RiskLevel;
}

// ==========================================================================
// Analytics & Metrics Types
// ==========================================================================

export interface RouteAnalytics {
  total_routes_analyzed: number;
  avg_temp_reduction: number;
  population_protected: number;
  emergency_routes_triggered: number;
  safe_routes_completed: number;
}

export interface AIAnalytics {
  total_queries: number;
  autonomous_reroutes: number;
  emergency_alerts: number;
  avg_response_time_ms: number;
  user_satisfaction: number;
}

export interface TimeBasedAnalytics {
  time_period: string;
  avg_risk: RiskLevel;
  peak_temperature: number;
  active_zones: number;
}

// ==========================================================================
// Chart Data Types
// ==========================================================================

export interface BarChartData {
  name: string;
  value: number;
  risk_level?: RiskLevel;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface LineChartData {
  name: string;
  temperature: number;
  risk_level: RiskLevel;
}

export interface RadarChartData {
  subject: string;
  value: number;
  fullMark: number;
}

// ==========================================================================
// AI Agent Types
// ==========================================================================

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: {
    temperature?: number;
    risk_level?: RiskLevel;
    action?: string;
  };
}

export interface AIAction {
  type: 'reroute' | 'alert' | 'report' | 'recommendation';
  payload: any;
  timestamp: string;
}

// ==========================================================================
// API Response Types
// ==========================================================================

export interface HeatMapResponse {
  location: string;
  city_data: {
    avg_temperature: number;
    risk_level: RiskLevel;
    zones: HeatZone[];
    emergency_locations: EmergencyLocation[];
  };
  timestamp: string;
}

export interface RouteResponse {
  fast_route: PlannedRoute;
  cool_route: PlannedRoute;
  recommendation: 'fast' | 'cool';
  reasoning: string;
}

export interface EmergencyAlert {
  id: string;
  type: 'heat_warning' | 'extreme_heat' | 'health_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affected_zones: string[];
  timestamp: string;
  action_required: string;
}

// ==========================================================================
// UI State Types
// ==========================================================================

export interface AppState {
  activeTab: 'map' | 'area' | 'ai' | 'analytics' | 'settings';
  selectedCity: string;
  routeMode: 'fast' | 'cool';
  selectedZone: string | null;
  temperatureData: TemperatureData | null;
  zones: HeatZone[];
  routes: {
    fast: PlannedRoute;
    cool: PlannedRoute;
  };
  chatMessages: ChatMessage[];
  emergencyAlerts: EmergencyAlert[];
  analytics: {
    route: RouteAnalytics;
    ai: AIAnalytics;
  };
  isLoading: boolean;
  error: string | null;
}

export interface MapSettings {
  showHeatLayer: boolean;
  showZones: boolean;
  showEmergencyLocations: boolean;
  showRoute: boolean;
  zoomLevel: number;
  center: Coordinate;
}

// ==========================================================================
// Theme & Styling Types
// ==========================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface RiskColorMap {
  low: ThemeColors;
  moderate: ThemeColors;
  high: ThemeColors;
  extreme: ThemeColors;
}

// ==========================================================================
// Configuration Types
// ==========================================================================

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  useMockData: boolean;
  refreshInterval: number;
}

export interface AppConfig {
  api: APIConfig;
  map: {
    defaultCenter: Coordinate;
    defaultZoom: number;
    minZoom: number;
    maxZoom: number;
  };
  theme: {
    darkMode: boolean;
    colors: RiskColorMap;
  };
}

// ==========================================================================
// Export all types
// ==========================================================================

export type {
  Coordinate as Coordinate,
  HeatZone as HeatZone,
  EmergencyLocation as EmergencyLocation,
  RouteWaypoint as RouteWaypoint,
  PlannedRoute as PlannedRoute,
  RiskLevel as RiskLevel,
  TemperatureData as TemperatureData,
  ZoneTemperatureData as ZoneTemperatureData,
  HourlyForecast as HourlyForecast,
  DailyTemperature as DailyTemperature,
  WeeklyTrend as WeeklyTrend,
  RouteAnalytics as RouteAnalytics,
  AIAnalytics as AIAnalytics,
  TimeBasedAnalytics as TimeBasedAnalytics,
  BarChartData as BarChartData,
  PieChartData as PieChartData,
  LineChartData as LineChartData,
  RadarChartData as RadarChartData,
  ChatMessage as ChatMessage,
  AIAction as AIAction,
  HeatMapResponse as HeatMapResponse,
  RouteResponse as RouteResponse,
  EmergencyAlert as EmergencyAlert,
  AppState as AppState,
  MapSettings as MapSettings,
  ThemeColors as ThemeColors,
  RiskColorMap as RiskColorMap,
  APIConfig as APIConfig,
  AppConfig as AppConfig,
};