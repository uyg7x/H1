// ============================================================================
// Custom Hook for API Data Fetching
// ============================================================================

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  getMockTemperatureData,
  getHeatMapData,
  getHeatZones,
  planRoute,
  getEmergencyAlerts,
  queryAgent,
  analyzeWithAgent,
  getAvailableCities,
  getStatistics,
  checkHealth,
} from '@/lib/api';
import { 
  TemperatureData, 
  HeatMapData, 
  HeatZone,
  PlannedRoute,
  RouteRequest,
  EmergencyAlert,
  AgentQuery,
  AgentResponse
} from '@/types';

// ============================================================================
// Query Hooks
// ============================================================================

export const useTemperatureData = (
  location: string = 'Phoenix, AZ',
  options?: Omit<UseQueryOptions<TemperatureData, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TemperatureData, Error>({
    queryKey: ['temperature-data', location],
    queryFn: () => getMockTemperatureData(location),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    ...options,
  });
};

export const useHeatMapData = (
  location: string = 'Phoenix, AZ',
  options?: Omit<UseQueryOptions<HeatMapData, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HeatMapData, Error>({
    queryKey: ['heat-map-data', location],
    queryFn: () => getHeatMapData(location),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    ...options,
  });
};

export const useHeatZones = (
  location: string = 'Phoenix, AZ',
  options?: Omit<UseQueryOptions<HeatZone[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HeatZone[], Error>({
    queryKey: ['heat-zones', location],
    queryFn: () => getHeatZones(location),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  });
};

export const useEmergencyAlerts = (
  location: string = 'Phoenix, AZ',
  options?: Omit<UseQueryOptions<EmergencyAlert[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EmergencyAlert[], Error>({
    queryKey: ['emergency-alerts', location],
    queryFn: () => getEmergencyAlerts(location),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    ...options,
  });
};

export const useAvailableCities = (
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<string[], Error>({
    queryKey: ['available-cities'],
    queryFn: getAvailableCities,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    retry: 2,
    initialData: [
      'Phoenix, AZ',
      'Las Vegas, NV',
      'Los Angeles, CA',
      'Houston, TX',
      'Miami, FL',
      'New York, NY',
      'Chicago, IL',
      'Atlanta, GA',
    ],
    ...options,
  });
};

export const useStatistics = (
  location: string = 'Phoenix, AZ',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, Error>({
    queryKey: ['statistics', location],
    queryFn: () => getStatistics(location),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useHealthCheck = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, Error>({
    queryKey: ['health-check'],
    queryFn: checkHealth,
    refetchInterval: 60 * 1000, // Check every minute
    retry: 3,
    ...options,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

export const usePlanRouteMutation = (
  options?: UseMutationOptions<PlannedRoute, Error, RouteRequest>
) => {
  return useMutation<PlannedRoute, Error, RouteRequest>({
    mutationFn: planRoute,
    retry: 2,
    ...options,
  });
};

export const useAgentQueryMutation = (
  options?: UseMutationOptions<AgentResponse, Error, AgentQuery>
) => {
  return useMutation<AgentResponse, Error, AgentQuery>({
    mutationFn: queryAgent,
    retry: 2,
    ...options,
  });
};

export const useAgentAnalyzeMutation = (
  options?: UseMutationOptions<AgentResponse, Error, { query: string; location?: string }>
) => {
  return useMutation<AgentResponse, Error, { query: string; location?: string }>({
    mutationFn: ({ query, location }) => analyzeWithAgent(query, location || 'Phoenix, AZ'),
    retry: 2,
    ...options,
  });
};

// ============================================================================
// Combined Hooks for Dashboard
// ============================================================================

export const useDashboardData = (location: string = 'Phoenix, AZ') => {
  const {
    data: temperatureData,
    isLoading: isLoadingTemperature,
    error: temperatureError,
  } = useTemperatureData(location);

  const {
    data: heatMapData,
    isLoading: isLoadingHeatMap,
    error: heatMapError,
  } = useHeatMapData(location);

  const {
    data: zones,
    isLoading: isLoadingZones,
    error: zonesError,
  } = useHeatZones(location);

  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    error: alertsError,
  } = useEmergencyAlerts(location);

  const isLoading = isLoadingTemperature || isLoadingHeatMap || isLoadingZones || isLoadingAlerts;
  const hasError = temperatureError || heatMapError || zonesError || alertsError;

  return {
    temperatureData,
    heatMapData,
    zones,
    alerts,
    isLoading,
    hasError,
    errors: {
      temperatureError,
      heatMapError,
      zonesError,
      alertsError,
    },
  };
};

// ============================================================================
// Prefetching Hooks
// ============================================================================

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchTemperatureData = (location: string) => {
    queryClient.prefetchQuery({
      queryKey: ['temperature-data', location],
      queryFn: () => getMockTemperatureData(location),
    });
  };

  const prefetchHeatMapData = (location: string) => {
    queryClient.prefetchQuery({
      queryKey: ['heat-map-data', location],
      queryFn: () => getHeatMapData(location),
    });
  };

  const prefetchAllData = (location: string) => {
    prefetchTemperatureData(location);
    prefetchHeatMapData(location);
    queryClient.prefetchQuery({
      queryKey: ['heat-zones', location],
      queryFn: () => getHeatZones(location),
    });
    queryClient.prefetchQuery({
      queryKey: ['emergency-alerts', location],
      queryFn: () => getEmergencyAlerts(location),
    });
  };

  return {
    prefetchTemperatureData,
    prefetchHeatMapData,
    prefetchAllData,
  };
};

// Import useQueryClient for the prefetch hook
import { useQueryClient } from '@tanstack/react-query';
