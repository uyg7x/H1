// ==========================================================================
// HeatGuard AI - Global State Context
// Production-grade state management for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, ChatMessage, EmergencyAlert, RiskLevel, ApiSettings } from '../lib/types';
import {
  mockTemperatureData,
  mockHeatZones,
  mockEmergencyLocations,
  mockRoutes,
  mockChatMessages,
  mockEmergencyAlerts,
  RISK_COLORS
} from '../lib/mockData';

// ==========================================================================
// Initial State
// ==========================================================================

const initialState: AppState = {
  activeTab: 'map',
  selectedCity: 'Phoenix, AZ',
  routeMode: 'cool',
  selectedZone: null,
  temperatureData: mockTemperatureData,
  zones: mockHeatZones,
  routes: mockRoutes,
  chatMessages: mockChatMessages,
  emergencyAlerts: mockEmergencyAlerts,
  analytics: {
    route: {
      total_routes_analyzed: 1247,
      avg_temp_reduction: 16.5,
      population_protected: 156000,
      emergency_routes_triggered: 42,
      safe_routes_completed: 1189,
    },
    ai: {
      total_queries: 892,
      autonomous_reroutes: 156,
      emergency_alerts: 23,
      avg_response_time_ms: 245,
      user_satisfaction: 94.2,
    },
  },
  isLoading: false,
  error: null,
  settings: {
    api_key: '',
    api_url: 'http://localhost:8001',
    refresh_rate: 30,
    use_mock_data: true,
  },
};

// ==========================================================================
// Context Type
// ==========================================================================

interface AppContextType extends AppState {
  // Tab Management
  setActiveTab: (tab: AppState['activeTab']) => void;
  
  // City & Zone Selection
  setSelectedCity: (city: string) => void;
  setSelectedZone: (zone: string | null) => void;
  
  // Route Management
  setRouteMode: (mode: 'fast' | 'cool') => void;
  toggleRouteMode: () => void;
  
  // Temperature Data
  setTemperatureData: (data: any) => void;
  updateTemperature: (temp: number, risk: RiskLevel) => void;
  
  // Chat Management
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Emergency Alerts
  addEmergencyAlert: (alert: EmergencyAlert) => void;
  clearEmergencyAlerts: () => void;
  
  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Settings
  settings: ApiSettings;
  updateSettings: (settings: Partial<ApiSettings>) => void;
  
  // Analytics
  incrementQueryCount: () => void;
  incrementRerouteCount: () => void;
  
  // AI Actions
  handleAIAction: (action: string, payload?: any) => void;
}

// ==========================================================================
// Create Context
// ==========================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================================================
// Context Provider
// ==========================================================================

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  // ==========================================================================
  // Tab Management
  // ==========================================================================

  const setActiveTab = useCallback((tab: AppState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // ==========================================================================
  // City & Zone Selection
  // ==========================================================================

  const setSelectedCity = useCallback((city: string) => {
    setState(prev => ({ ...prev, selectedCity: city }));
  }, []);

  const setSelectedZone = useCallback((zone: string | null) => {
    setState(prev => ({ ...prev, selectedZone: zone }));
  }, []);

  // ==========================================================================
  // Route Management
  // ==========================================================================

  const setRouteMode = useCallback((mode: 'fast' | 'cool') => {
    setState(prev => ({ ...prev, routeMode: mode }));
  }, []);

  const toggleRouteMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      routeMode: prev.routeMode === 'fast' ? 'cool' : 'fast'
    }));
  }, []);

  // ==========================================================================
  // Temperature Data
  // ==========================================================================

  const setTemperatureData = useCallback((data: any) => {
    setState(prev => ({ ...prev, temperatureData: data }));
  }, []);

  const updateTemperature = useCallback((temp: number, risk: RiskLevel) => {
    setState(prev => ({
      ...prev,
      temperatureData: prev.temperatureData ? {
        ...prev.temperatureData,
        temperature_f: temp,
        risk_level: risk
      } : null
    }));
  }, []);

  // ==========================================================================
  // Chat Management
  // ==========================================================================

  const addChatMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, message],
      analytics: {
        ...prev.analytics,
        ai: {
          ...prev.analytics.ai,
          total_queries: prev.analytics.ai.total_queries + 1
        }
      }
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({ ...prev, chatMessages: [] }));
  }, []);

  // ==========================================================================
  // Emergency Alerts
  // ==========================================================================

  const addEmergencyAlert = useCallback((alert: EmergencyAlert) => {
    setState(prev => ({
      ...prev,
      emergencyAlerts: [alert, ...prev.emergencyAlerts],
      analytics: {
        ...prev.analytics,
        ai: {
          ...prev.analytics.ai,
          emergency_alerts: prev.analytics.ai.emergency_alerts + 1
        }
      }
    }));
  }, []);

  const clearEmergencyAlerts = useCallback(() => {
    setState(prev => ({ ...prev, emergencyAlerts: [] }));
  }, []);

  // ==========================================================================
  // Loading & Error
  // ==========================================================================

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // ==========================================================================
  // API Settings
  // ==========================================================================

  const updateSettings = useCallback((newSettings: Partial<ApiSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  }, []);

  // ==========================================================================
  // Analytics
  // ==========================================================================

  const incrementQueryCount = useCallback(() => {
    setState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        ai: {
          ...prev.analytics.ai,
          total_queries: prev.analytics.ai.total_queries + 1
        }
      }
    }));
  }, []);

  const incrementRerouteCount = useCallback(() => {
    setState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        ai: {
          ...prev.analytics.ai,
          autonomous_reroutes: prev.analytics.ai.autonomous_reroutes + 1
        }
      }
    }));
  }, []);

  // ==========================================================================
  // AI Actions
  // ==========================================================================

  const handleAIAction = useCallback((action: string, payload?: any) => {
    switch (action) {
      case 'reroute':
        setRouteMode('cool');
        incrementRerouteCount();
        setActiveTab('map');
        break;
      case 'alert':
        if (payload) {
          addEmergencyAlert(payload);
        }
        break;
      case 'switch-tab':
        if (payload) {
          setActiveTab(payload as AppState['activeTab']);
        }
        break;
      default:
        console.log('Unknown AI action:', action);
    }
  }, [setRouteMode, incrementRerouteCount, setActiveTab, addEmergencyAlert]);

  // ==========================================================================
  // Auto-refresh temperature data
  // ==========================================================================

  useEffect(() => {
    // Simulate data refresh
    const interval = setInterval(() => {
      // Random temperature fluctuation
      const tempFluctuation = Math.floor(Math.random() * 4) - 2;
      const newTemp = Math.max(80, Math.min(120, 
        (state.temperatureData?.temperature_f || 112) + tempFluctuation));
      
      // Determine risk level based on temperature
      let risk: RiskLevel = 'low';
      if (newTemp >= 106) risk = 'extreme';
      else if (newTemp >= 96) risk = 'high';
      else if (newTemp >= 86) risk = 'moderate';
      
      updateTemperature(newTemp, risk);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [state.temperatureData?.temperature_f, updateTemperature]);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: AppContextType = {
    // State
    ...state,
    
    // Tab Management
    setActiveTab,
    
    // City & Zone Selection
    setSelectedCity,
    setSelectedZone,
    
    // Route Management
    setRouteMode,
    toggleRouteMode,
    
    // Temperature Data
    setTemperatureData,
    updateTemperature,
    
    // Chat Management
    addChatMessage,
    clearChat,
    
    // Emergency Alerts
    addEmergencyAlert,
    clearEmergencyAlerts,
    
    // Loading & Error
    setLoading,
    setError,

    // API Settings
    settings: state.settings,
    updateSettings,
    
    // Analytics
    incrementQueryCount,
    incrementRerouteCount,
    
    // AI Actions
    handleAIAction,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ==========================================================================
// Custom Hook
// ==========================================================================

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// ==========================================================================
// Export
// ==========================================================================

export { AppContext, initialState };
export default AppProvider;