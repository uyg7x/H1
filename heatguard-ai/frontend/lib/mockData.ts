// ==========================================================================
// HeatGuard AI - Mock Data
// Production-grade mock data for FortyGuard Global AI Hackathon '26
// Replace with real FortyGuard API data on August 18, 2026
// ==========================================================================

import {
  TemperatureData,
  HeatZone,
  EmergencyLocation,
  PlannedRoute,
  HourlyForecast,
  DailyTemperature,
  WeeklyTrend,
  RouteAnalytics,
  AIAnalytics,
  TimeBasedAnalytics,
  EmergencyAlert,
  ChatMessage,
  RiskLevel
} from './types';

// ==========================================================================
// Configuration Constants
// ==========================================================================

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 33.4484, lng: -112.0740 } as const,
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
};

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8001',
  REFRESH_INTERVAL: 30000, // 30 seconds
  USE_MOCK_DATA: true,
};

// ==========================================================================
// Risk Level Configuration
// ==========================================================================

export const RISK_LEVELS: RiskLevel[] = ['low', 'moderate', 'high', 'extreme'];

export const RISK_COLORS = {
  low: {
    primary: '#10b981',
    secondary: '#059669',
    light: '#d1fae5',
    dark: '#065f46',
  },
  moderate: {
    primary: '#f59e0b',
    secondary: '#d97706',
    light: '#fef3c7',
    dark: '#92400e',
  },
  high: {
    primary: '#ef4444',
    secondary: '#dc2626',
    light: '#fee2e2',
    dark: '#991b1b',
  },
  extreme: {
    primary: '#dc2626',
    secondary: '#b91c1c',
    light: '#fee2e2',
    dark: '#7f1d1d',
  },
} as const;

export const RISK_THRESHOLDS = {
  low: { max: 85 },
  moderate: { min: 86, max: 95 },
  high: { min: 96, max: 105 },
  extreme: { min: 106 },
};

// ==========================================================================
// Main Temperature Data (Phoenix, AZ)
// ==========================================================================

export const mockTemperatureData: TemperatureData = {
  location: 'Phoenix, AZ',
  temperature_f: 112.5,
  temperature_c: 44.7,
  risk_level: 'extreme',
  humidity: 15.0,
  heat_index: 125.0,
  measured_at: '2m above ground',
  resolution: '10mi²',
  credits_remaining: 999999,
  timestamp: new Date().toISOString(),
};

// ==========================================================================
// Heat Zones Data
// ==========================================================================

export const mockHeatZones: HeatZone[] = [
  {
    id: 'downtown',
    name: 'Downtown Phoenix',
    polygon: [
      { lat: 33.4484, lng: -112.0740 },
      { lat: 33.4520, lng: -112.0740 },
      { lat: 33.4520, lng: -112.0700 },
      { lat: 33.4484, lng: -112.0700 },
      { lat: 33.4484, lng: -112.0740 },
    ],
    avg_temperature_f: 112.0,
    risk_level: 'extreme',
    population: 45000,
    area_km2: 15.2,
  },
  {
    id: 'industrial',
    name: 'Industrial District',
    polygon: [
      { lat: 33.4550, lng: -112.0800 },
      { lat: 33.4600, lng: -112.0800 },
      { lat: 33.4600, lng: -112.0750 },
      { lat: 33.4550, lng: -112.0750 },
      { lat: 33.4550, lng: -112.0800 },
    ],
    avg_temperature_f: 115.0,
    risk_level: 'extreme',
    population: 12000,
    area_km2: 8.7,
  },
  {
    id: 'residential',
    name: 'Residential Areas',
    polygon: [
      { lat: 33.4450, lng: -112.0850 },
      { lat: 33.4500, lng: -112.0850 },
      { lat: 33.4500, lng: -112.0800 },
      { lat: 33.4450, lng: -112.0800 },
      { lat: 33.4450, lng: -112.0850 },
    ],
    avg_temperature_f: 105.0,
    risk_level: 'high',
    population: 89000,
    area_km2: 22.4,
  },
  {
    id: 'parks',
    name: 'City Parks',
    polygon: [
      { lat: 33.4600, lng: -112.0650 },
      { lat: 33.4650, lng: -112.0650 },
      { lat: 33.4650, lng: -112.0600 },
      { lat: 33.4600, lng: -112.0600 },
      { lat: 33.4600, lng: -112.0650 },
    ],
    avg_temperature_f: 94.0,
    risk_level: 'moderate',
    population: 5000,
    area_km2: 12.8,
  },
];

// ==========================================================================
// Emergency Locations
// ==========================================================================

export const mockEmergencyLocations: EmergencyLocation[] = [
  {
    id: 'phoenix-general',
    name: 'Phoenix General Hospital',
    type: 'hospital',
    latitude: 33.4540,
    longitude: -112.0660,
    temperature: 75.0,
    capacity: '24/7 Emergency Services',
    address: '123 Health Way, Phoenix, AZ',
  },
  {
    id: 'central-fire',
    name: 'Central Fire Station',
    type: 'fire_station',
    latitude: 33.4500,
    longitude: -112.0700,
    temperature: 78.0,
    capacity: '10 Fire Trucks, 40 Personnel',
    address: '456 Safety Ave, Phoenix, AZ',
  },
  {
    id: 'cool-haven',
    name: 'Cool Haven Community Center',
    type: 'cooling_center',
    latitude: 33.4450,
    longitude: -112.0750,
    temperature: 72.0,
    capacity: '500 People, 8AM-8PM',
    address: '789 Cool St, Phoenix, AZ',
  },
  {
    id: 'desert-ridge-mall',
    name: 'Desert Ridge Mall',
    type: 'cooling_center',
    latitude: 33.4520,
    longitude: -112.0680,
    temperature: 70.0,
    capacity: '2000 People, 10AM-10PM',
    address: '1011 Shopping Blvd, Phoenix, AZ',
  },
];

// ==========================================================================
// Route Data
// ==========================================================================

export const mockRoutes = {
  fast: {
    id: 'fast-route',
    name: 'Fastest Route',
    waypoints: [
      { lat: 33.4484, lng: -112.0740 }, // City Hall
      { lat: 33.4520, lng: -112.0700 }, // Through downtown
      { lat: 33.4580, lng: -112.0650 }, // Through industrial
      { lat: 33.4650, lng: -112.0600 }, // Hospital
    ],
    distance_km: 4.2,
    duration_minutes: 12,
    avg_temperature: 110.0,
    risk_level: 'extreme',
    route_type: 'fast',
  } as PlannedRoute,
  cool: {
    id: 'cool-route',
    name: 'Coolest Route',
    waypoints: [
      { lat: 33.4484, lng: -112.0740 }, // City Hall
      { lat: 33.4490, lng: -112.0780 }, // Around downtown
      { lat: 33.4560, lng: -112.0720 }, // Through parks
      { lat: 33.4650, lng: -112.0600 }, // Hospital
    ],
    distance_km: 5.1,
    duration_minutes: 15,
    avg_temperature: 94.0,
    risk_level: 'moderate',
    route_type: 'cool',
  } as PlannedRoute,
};

// ==========================================================================
// Forecast Data
// ==========================================================================

export const mockHourlyForecast: HourlyForecast[] = [
  { hour: '6AM', temperature_f: 85, risk_level: 'low', timestamp: '2026-08-15T06:00:00Z' },
  { hour: '8AM', temperature_f: 92, risk_level: 'moderate', timestamp: '2026-08-15T08:00:00Z' },
  { hour: '10AM', temperature_f: 101, risk_level: 'high', timestamp: '2026-08-15T10:00:00Z' },
  { hour: '12PM', temperature_f: 108, risk_level: 'extreme', timestamp: '2026-08-15T12:00:00Z' },
  { hour: '2PM', temperature_f: 112, risk_level: 'extreme', timestamp: '2026-08-15T14:00:00Z' },
  { hour: '4PM', temperature_f: 110, risk_level: 'extreme', timestamp: '2026-08-15T16:00:00Z' },
  { hour: '6PM', temperature_f: 104, risk_level: 'high', timestamp: '2026-08-15T18:00:00Z' },
  { hour: '8PM', temperature_f: 96, risk_level: 'moderate', timestamp: '2026-08-15T20:00:00Z' },
  { hour: '10PM', temperature_f: 89, risk_level: 'low', timestamp: '2026-08-15T22:00:00Z' },
];

export const mockDailyTemperatures: DailyTemperature[] = [
  { date: '2026-08-08', avg_temp: 105, max_temp: 112, min_temp: 88, risk_level: 'high' },
  { date: '2026-08-09', avg_temp: 108, max_temp: 115, min_temp: 92, risk_level: 'extreme' },
  { date: '2026-08-10', avg_temp: 110, max_temp: 118, min_temp: 95, risk_level: 'extreme' },
  { date: '2026-08-11', avg_temp: 107, max_temp: 114, min_temp: 91, risk_level: 'extreme' },
  { date: '2026-08-12', avg_temp: 104, max_temp: 111, min_temp: 89, risk_level: 'high' },
  { date: '2026-08-13', avg_temp: 102, max_temp: 109, min_temp: 87, risk_level: 'high' },
  { date: '2026-08-14', avg_temp: 108, max_temp: 115, min_temp: 93, risk_level: 'extreme' },
];

export const mockWeeklyTrends: WeeklyTrend[] = [
  { day: 'Mon', avg_temp: 105, peak_temp: 112, risk_level: 'high' },
  { day: 'Tue', avg_temp: 108, peak_temp: 115, risk_level: 'extreme' },
  { day: 'Wed', avg_temp: 110, peak_temp: 118, risk_level: 'extreme' },
  { day: 'Thu', avg_temp: 107, peak_temp: 114, risk_level: 'extreme' },
  { day: 'Fri', avg_temp: 104, peak_temp: 111, risk_level: 'high' },
  { day: 'Sat', avg_temp: 102, peak_temp: 109, risk_level: 'high' },
  { day: 'Sun', avg_temp: 108, peak_temp: 115, risk_level: 'extreme' },
];

// ==========================================================================
// Analytics Data
// ==========================================================================

export const mockRouteAnalytics: RouteAnalytics = {
  total_routes_analyzed: 1247,
  avg_temp_reduction: 16.5,
  population_protected: 156000,
  emergency_routes_triggered: 42,
  safe_routes_completed: 1189,
};

export const mockAIAnalytics: AIAnalytics = {
  total_queries: 892,
  autonomous_reroutes: 156,
  emergency_alerts: 23,
  avg_response_time_ms: 245,
  user_satisfaction: 94.2,
};

export const mockTimeBasedAnalytics: TimeBasedAnalytics[] = [
  { time_period: 'Morning (6AM-12PM)', avg_risk: 'high', peak_temperature: 108, active_zones: 4 },
  { time_period: 'Afternoon (12PM-6PM)', avg_risk: 'extreme', peak_temperature: 115, active_zones: 4 },
  { time_period: 'Evening (6PM-10PM)', avg_risk: 'moderate', peak_temperature: 104, active_zones: 4 },
  { time_period: 'Night (10PM-6AM)', avg_risk: 'low', peak_temperature: 89, active_zones: 2 },
];

// ==========================================================================
// Emergency Alerts
// ==========================================================================

export const mockEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'alert-001',
    type: 'extreme_heat',
    severity: 'critical',
    message: 'Extreme heat warning: Downtown and Industrial zones exceeding 115°F',
    affected_zones: ['downtown', 'industrial'],
    timestamp: new Date().toISOString(),
    action_required: 'Activate cooling centers, issue public advisory',
  },
  {
    id: 'alert-002',
    type: 'heat_warning',
    severity: 'high',
    message: 'Heat advisory: Residential areas approaching 105°F',
    affected_zones: ['residential'],
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    action_required: 'Monitor vulnerable populations',
  },
];

// ==========================================================================
// AI Chat Messages
// ==========================================================================

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    sender: 'ai',
    content: 'Welcome to HeatGuard AI! I can help you analyze heat risks, plan safe routes, and manage emergency responses. Current temperature in Phoenix: 112.5°F (Extreme Risk).',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    metadata: {
      temperature: 112.5,
      risk_level: 'extreme',
    },
  },
  {
    id: 'msg-002',
    sender: 'user',
    content: 'What is the current temperature?',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'msg-003',
    sender: 'ai',
    content: 'Current temperature in Phoenix, AZ is 112.5°F with Extreme risk level. Measured 2m above ground at 10mi² resolution.',
    timestamp: new Date(Date.now() - 15000).toISOString(),
    metadata: {
      temperature: 112.5,
      risk_level: 'extreme',
    },
  },
];

// ==========================================================================
// Chart Data
// ==========================================================================

export const mockBarChartData = [
  { name: '6AM', value: 85, risk_level: 'low' },
  { name: '8AM', value: 92, risk_level: 'moderate' },
  { name: '10AM', value: 101, risk_level: 'high' },
  { name: '12PM', value: 108, risk_level: 'extreme' },
  { name: '2PM', value: 112, risk_level: 'extreme' },
  { name: '4PM', value: 110, risk_level: 'extreme' },
  { name: '6PM', value: 104, risk_level: 'high' },
  { name: '8PM', value: 96, risk_level: 'moderate' },
];

export const mockPieChartData = [
  { name: 'Extreme', value: 40, color: RISK_COLORS.extreme.primary },
  { name: 'High', value: 30, color: RISK_COLORS.high.primary },
  { name: 'Moderate', value: 20, color: RISK_COLORS.moderate.primary },
  { name: 'Low', value: 10, color: RISK_COLORS.low.primary },
];

export const mockLineChartData = [
  { name: 'Aug 8', temperature: 105, risk_level: 'high' },
  { name: 'Aug 9', temperature: 108, risk_level: 'extreme' },
  { name: 'Aug 10', temperature: 110, risk_level: 'extreme' },
  { name: 'Aug 11', temperature: 107, risk_level: 'extreme' },
  { name: 'Aug 12', temperature: 104, risk_level: 'high' },
  { name: 'Aug 13', temperature: 102, risk_level: 'high' },
  { name: 'Aug 14', temperature: 108, risk_level: 'extreme' },
];

export const mockRadarChartData = [
  { subject: 'Downtown', value: 112, fullMark: 120 },
  { subject: 'Industrial', value: 115, fullMark: 120 },
  { subject: 'Residential', value: 105, fullMark: 120 },
  { subject: 'Parks', value: 94, fullMark: 120 },
  { subject: 'Average', value: 106, fullMark: 120 },
];

// ==========================================================================
// Heat Zone Circle for Map Visualization
// ==========================================================================

export const heatZoneCircle = {
  center: { lat: 33.4550, lng: -112.0680 } as const,
  radius: 450,
  temperature: 115,
  risk_level: 'extreme' as const,
};

// ==========================================================================
// City Data
// ==========================================================================

const cities = [
  { value: 'Phoenix, AZ', label: 'Phoenix, AZ' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'Dallas, TX', label: 'Dallas, TX' },
  { value: 'Atlanta, GA', label: 'Atlanta, GA' },
  { value: 'Miami, FL', label: 'Miami, FL' },
];

// ==========================================================================
// Quick Action Commands for AI
// ==========================================================================

export const quickActions = [
  {
    id: 'safe-route',
    label: '🗺️ Find Safest Route',
    command: 'Find the coolest path to the hospital avoiding heat zones.',
    icon: 'Route',
    color: 'bg-green-600',
  },
  {
    id: 'heat-report',
    label: '📊 Show Heat Risk Report',
    command: 'Generate a comprehensive heat risk report for all zones.',
    icon: 'BarChart3',
    color: 'bg-orange-600',
  },
  {
    id: 'emergency-alert',
    label: '🚨 Alert Emergency Services',
    command: 'Issue extreme heat alert for all high-risk zones.',
    icon: 'AlertTriangle',
    color: 'bg-red-600',
  },
  {
    id: 'cooling-centers',
    label: '❄️ Deploy Cooling Centers',
    command: 'Show me all cooling shelters within 0.5 miles of high-risk areas.',
    icon: 'Snowflake',
    color: 'bg-blue-600',
  },
];

// ==========================================================================
// All exports are inline (export const ...) above.
// No bottom export block — keeps the file duplicate-free.
// ==========================================================================