// ============================================================================
// API Client Configuration
// ============================================================================

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { APIResponse, HealthCheckResponse, TemperatureData, HeatMapData } from '@/types';

// Create API client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any required headers (e.g., API keys)
    // const apiKey = localStorage.getItem('api_key');
    // if (apiKey) {
    //   config.headers.Authorization = `Bearer ${apiKey}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<APIResponse>) => {
    // Handle successful responses
    return response;
  },
  (error: AxiosError<APIResponse>) => {
    // Handle errors globally
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', error.response.data?.error);
          break;
        case 401:
          console.error('Unauthorized:', error.response.data?.error);
          break;
        case 403:
          console.error('Forbidden:', error.response.data?.error);
          break;
        case 404:
          console.error('Not Found:', error.response.data?.error);
          break;
        case 500:
          console.error('Server Error:', error.response.data?.error);
          break;
        default:
          console.error('Unexpected Error:', error.response.data?.error);
      }
    } else if (error.request) {
      console.error('Network Error: No response received');
    } else {
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// API Endpoint Functions
// ============================================================================

// Health Check
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Mock Temperature Data
export const getMockTemperatureData = async (
  location: string = 'Phoenix, AZ'
): Promise<TemperatureData> => {
  try {
    const response = await apiClient.get<TemperatureData>(
      `/api/mock-heat-data?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch temperature data:', error);
    // Return fallback data
    return {
      location,
      temperature_f: 112.0,
      risk_level: 'extreme',
      resolution: '10mi²',
      measured_at: '2m above ground',
      credits_remaining: 999999,
      humidity: 15.0,
      heat_index: 125.0,
    };
  }
};

// Heat Map Data
export const getHeatMapData = async (
  location: string = 'Phoenix, AZ'
): Promise<HeatMapData> => {
  try {
    const response = await apiClient.get<HeatMapData>(
      `/api/heat-map?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch heat map data:', error);
    throw error;
  }
};

// Heat Zones
import { HeatZone } from '@/types';

export const getHeatZones = async (
  location: string = 'Phoenix, AZ'
): Promise<HeatZone[]> => {
  try {
    const response = await apiClient.get<HeatZone[]>(
      `/api/zones?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch heat zones:', error);
    return [];
  }
};

// Route Planning
import { PlannedRoute, RouteRequest } from '@/types';

export const planRoute = async (request: RouteRequest): Promise<PlannedRoute> => {
  try {
    const response = await apiClient.post<PlannedRoute>('/api/route', request);
    return response.data;
  } catch (error) {
    console.error('Failed to plan route:', error);
    throw error;
  }
};

// Emergency Alerts
import { EmergencyAlert } from '@/types';

export const getEmergencyAlerts = async (
  location: string = 'Phoenix, AZ'
): Promise<EmergencyAlert[]> => {
  try {
    const response = await apiClient.get<EmergencyAlert[]>(
      `/api/emergency-alerts?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch emergency alerts:', error);
    return [];
  }
};

// AI Agent Query
import { AgentQuery, AgentResponse } from '@/types';

export const queryAgent = async (query: AgentQuery): Promise<AgentResponse> => {
  try {
    const response = await apiClient.post<AgentResponse>('/api/agent-query', query);
    return response.data;
  } catch (error) {
    console.error('Failed to query agent:', error);
    // Return a fallback response
    return {
      response_id: `fallback-${Date.now()}`,
      query: query.query,
      action: 'query',
      summary: 'Fallback response due to API error',
      detailed_response: 'I encountered an error connecting to the AI service. Please try again later.',
      recommendations: [],
      alerts: ['Connection error - please check your internet connection'],
      timestamp: new Date().toISOString(),
      confidence: 0.5,
    };
  }
};

// Simple Agent Analysis
export const analyzeWithAgent = async (
  query: string,
  location: string = 'Phoenix, AZ'
): Promise<AgentResponse> => {
  try {
    const response = await apiClient.post<AgentResponse>(
      `/api/agent-analyze?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to analyze with agent:', error);
    throw error;
  }
};

// Statistics
export const getStatistics = async (
  location: string = 'Phoenix, AZ'
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/api/statistics?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    return null;
  }
};

// Available Cities
export const getAvailableCities = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get<string[]>('/api/cities');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available cities:', error);
    return [
      'Phoenix, AZ',
      'Las Vegas, NV',
      'Los Angeles, CA',
      'Houston, TX',
      'Miami, FL',
      'New York, NY',
      'Chicago, IL',
      'Atlanta, GA',
    ];
  }
};

// ============================================================================
// API Helper Functions
// ============================================================================

// Generic GET request
export const apiGet = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`GET ${url} failed:`, error);
    throw error;
  }
};

// Generic POST request
export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`POST ${url} failed:`, error);
    throw error;
  }
};

// Generic PUT request
export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`PUT ${url} failed:`, error);
    throw error;
  }
};

// Generic DELETE request
export const apiDelete = async <T>(url: string): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url);
    return response.data;
  } catch (error) {
    console.error(`DELETE ${url} failed:`, error);
    throw error;
  }
};

export default apiClient;
