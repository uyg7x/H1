// ============================================================================
// Application Constants
// ============================================================================

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  TIMEOUT: 10000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [33.4484, -112.0740] as [number, number], // Phoenix, AZ
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  
  // Tile layers
  TILE_LAYERS: {
    OSM_STANDARD: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    OSM_HOT: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    OSM_DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
  
  // Attribution
  ATTRIBUTION: {
    OSM: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    CARTO: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  
  // Default bounds
  DEFAULT_BOUNDS: {
    north: 33.5,
    south: 33.4,
    east: -112.0,
    west: -112.1,
  },
};

// Temperature Thresholds
export const TEMPERATURE_THRESHOLDS = {
  EXTREME: 110,
  HIGH: 105,
  MODERATE: 100,
  LOW: 90,
  SAFE: 80,
};

// Risk Level Colors
export const RISK_COLORS = {
  low: {
    primary: '#10b981',
    secondary: '#059669',
    bg: 'rgba(16, 185, 129, 0.2)',
    border: '#059669',
  },
  moderate: {
    primary: '#f59e0b',
    secondary: '#d97706',
    bg: 'rgba(245, 158, 11, 0.2)',
    border: '#d97706',
  },
  high: {
    primary: '#ea580c',
    secondary: '#c2410c',
    bg: 'rgba(234, 88, 12, 0.2)',
    border: '#c2410c',
  },
  extreme: {
    primary: '#dc2626',
    secondary: '#991b1b',
    bg: 'rgba(220, 38, 38, 0.2)',
    border: '#991b1b',
  },
  critical: {
    primary: '#7f1d1d',
    secondary: '#5f1212',
    bg: 'rgba(127, 29, 29, 0.3)',
    border: '#7f1d1d',
  },
};

// Risk level display labels
export const RISK_LABELS: Record<string, string> = {
  low: 'Safe',
  moderate: 'Caution',
  high: 'High Risk',
  extreme: 'Extreme Danger',
  critical: 'Critical',
  unknown: 'Unknown',
};

// Risk Level Icons
export const RISK_ICONS = {
  low: '🟢',
  moderate: '🟡',
  high: '🟠',
  extreme: '🔴',
  critical: '💥',
};

// Location Types Configuration
export const LOCATION_TYPES = {
  hospital: {
    icon: '🏥',
    color: '#3b82f6',
    label: 'Hospital',
    priority: 1,
  },
  cooling_center: {
    icon: '❄️',
    color: '#059669',
    label: 'Cooling Center',
    priority: 1,
  },
  fire_station: {
    icon: '🚒',
    color: '#ef4444',
    label: 'Fire Station',
    priority: 2,
  },
  police_station: {
    icon: '👮',
    color: '#3b82f6',
    label: 'Police Station',
    priority: 2,
  },
  shelter: {
    icon: '🏠',
    color: '#8b5cf6',
    label: 'Shelter',
    priority: 1,
  },
};

// UI Configuration
export const UI_CONFIG = {
  // Sidebar
  SIDEBAR_WIDTH: 320,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  
  // Chat widget
  CHAT_WIDTH: 360,
  CHAT_MIN_WIDTH: 280,
  CHAT_MAX_HEIGHT: 500,
  
  // Notifications
  NOTIFICATION_TIMEOUT: 5000,
  NOTIFICATION_MAX: 5,
  
  // Animations
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 200,
  
  // Debounce delays
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_MAP_MOVE: 200,
  
  // Polling intervals
  POLLING_INTERVAL: 30000, // 30 seconds
  EMERGENCY_POLLING_INTERVAL: 15000, // 15 seconds
};

// Theme Configuration
export const THEME = {
  DARK: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      card: '#0f172a',
      overlay: 'rgba(15, 23, 42, 0.8)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      tertiary: '#64748b',
      muted: '#475569',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      muted: '#64748b',
    },
  },
  LIGHT: {
    background: {
      primary: '#f8fafc',
      secondary: '#f1f5f9',
      tertiary: '#e2e8f0',
      card: '#ffffff',
      overlay: 'rgba(248, 250, 252, 0.8)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
    },
  },
};

// Form Configuration
export const FORMS = {
  LOCATION_SEARCH: {
    placeholder: 'Search for a city...',
    debounce: 300,
    maxResults: 5,
  },
  ROUTE_PLanner: {
    startPlaceholder: 'Start location or address',
    endPlaceholder: 'Destination or address',
    maxSuggestions: 3,
  },
  CHAT_INPUT: {
    placeholder: 'Ask HeatGuard AI...',
    maxLength: 500,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  UNAUTHORIZED: 'Unauthorized. Please login.',
  FORBIDDEN: 'Forbidden. You do not have permission.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unknown error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ROUTE_PLANNED: 'Route planned successfully!',
  LOCATION_FOUND: 'Location found!',
  AGENT_RESPONSE: 'AI Agent response received!',
  DATA_LOADED: 'Data loaded successfully!',
};

// Storage Keys
export const STORAGE_KEYS = {
  SELECTED_CITY: 'heatguard-selected-city',
  MAP_VIEW: 'heatguard-map-view',
  CHAT_HISTORY: 'heatguard-chat-history',
  THEME_PREFERENCE: 'heatguard-theme',
  USER_PREFERENCES: 'heatguard-user-preferences',
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_CHAT: true,
  ENABLE_ROUTE_PLANNING: true,
  ENABLE_EMERGENCY_ALERTS: true,
  ENABLE_HEAT_MAP: true,
  ENABLE_MOCK_DATA: true,
  SHOW_DEBUG_INFO: process.env.NODE_ENV === 'development',
};
