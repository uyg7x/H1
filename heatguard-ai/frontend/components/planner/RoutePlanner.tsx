// ============================================================================
// Route Planner Component
// Plan safe routes based on temperature data (Track 01)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { usePlanRouteMutation } from '@/hooks/useApi';
import { PlannedRoute, RouteRequest, RouteOptimization, TemperatureData } from '@/types';
import { RISK_COLORS, LOCATION_TYPES } from '@/lib/constants';

interface RoutePlannerProps {
  city?: string;
  temperatureData?: TemperatureData;
  onRoutePlanned?: (route: PlannedRoute) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  city = 'Phoenix, AZ',
  temperatureData,
  onRoutePlanned,
}) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [optimization, setOptimization] = useState<RouteOptimization>('safety');
  const [avoidExtreme, setAvoidExtreme] = useState(true);
  const [maxTemperature, setMaxTemperature] = useState<number | undefined>(undefined);
  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // API mutation
  const { mutate: planRoute, isPending, isSuccess, isError } = usePlanRouteMutation();
  
  // Suggested locations based on city
  const getSuggestedLocations = useCallback(() => {
    const locations: Record<string, string[]> = {
      'Phoenix, AZ': [
        'Phoenix General Hospital',
        'City Cooling Shelter - Downtown',
        'East Valley Cooling Center',
        'Phoenix Fire Station #1',
        'Downtown Phoenix',
        'Phoenix Convention Center',
        'Sky Harbor Airport',
      ],
      'Las Vegas, NV': [
        'Sunrise Hospital',
        'Las Vegas Cooling Shelter',
        'Downtown Las Vegas',
        'The Strip',
        'McCarran Airport',
      ],
      default: [
        'Downtown',
        'City Center',
        'Airport',
        'Hospital',
        'Cooling Center',
      ],
    };
    
    return locations[city] || locations.default;
  }, [city]);
  
  // Handle planning a route
  const handlePlanRoute = useCallback(() => {
    if (!startLocation || !endLocation) {
      setError('Please enter both start and end locations');
      return;
    }
    
    setError(null);
    
    const request: RouteRequest = {
      start_location: startLocation,
      end_location: endLocation,
      optimization,
      avoid_extreme: avoidExtreme,
      max_temperature: maxTemperature,
    };
    
    planRoute(request, {
      onSuccess: (route: PlannedRoute) => {
        setPlannedRoute(route);
        if (onRoutePlanned) {
          onRoutePlanned(route);
        }
      },
      onError: (error: Error) => {
        setError(error.message || 'Failed to plan route');
      },
    });
  }, [
    startLocation,
    endLocation,
    optimization,
    avoidExtreme,
    maxTemperature,
    planRoute,
    onRoutePlanned,
  ]);
  
  // Clear route
  const handleClearRoute = useCallback(() => {
    setPlannedRoute(null);
    setStartLocation('');
    setEndLocation('');
  }, []);
  
  // Predefined routes for quick selection
  const handleQuickRoute = useCallback((start: string, end: string) => {
    setStartLocation(start);
    setEndLocation(end);
  }, []);
  
  // Key down handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePlanRoute();
    }
  }, [handlePlanRoute]);
  
  return (
    <div className="p-4 space-y-4">
      {/* Quick Route Buttons */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Quick Routes</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickRoute('Downtown Phoenix', 'Phoenix General Hospital')}
            className="text-xs bg-background-tertiary hover:bg-background-secondary text-text-primary px-3 py-2 rounded-lg transition-colors truncate text-left"
          >
            Downtown → Hospital
          </button>
          <button
            onClick={() => handleQuickRoute('Downtown Phoenix', 'City Cooling Shelter')}
            className="text-xs bg-background-tertiary hover:bg-background-secondary text-text-primary px-3 py-2 rounded-lg transition-colors truncate text-left"
          >
            Downtown → Shelter
          </button>
          <button
            onClick={() => handleQuickRoute('Phoenix General Hospital', 'City Cooling Shelter')}
            className="text-xs bg-background-tertiary hover:bg-background-secondary text-text-primary px-3 py-2 rounded-lg transition-colors truncate text-left"
          >
            Hospital → Shelter
          </button>
          <button
            onClick={() => handleQuickRoute('East Valley', 'Downtown Phoenix')}
            className="text-xs bg-background-tertiary hover:bg-background-secondary text-text-primary px-3 py-2 rounded-lg transition-colors truncate text-left"
          >
            East Valley → Downtown
          </button>
        </div>
      </div>
      
      {/* Route Planning Form */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">Plan a Safe Route</h3>
        
        {/* Start Location */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-text-tertiary mb-1">Start Location</label>
          <input
            type="text"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Downtown Phoenix"
            className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            list="start-locations"
          />
          <datalist id="start-locations">
            {getSuggestedLocations().map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>
        
        {/* End Location */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-text-tertiary mb-1">Destination</label>
          <input
            type="text"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Phoenix General Hospital"
            className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            list="end-locations"
          />
          <datalist id="end-locations">
            {getSuggestedLocations().map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>
        
        {/* Optimization Options */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-text-tertiary mb-2">Optimization</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setOptimization('safety')}
              className={`text-xs px-3 py-2 rounded-lg transition-all ${
                optimization === 'safety'
                  ? 'bg-heat-low/20 text-heat-low border border-heat-low'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              <div className="font-semibold">Safety</div>
              <div className="text-xs opacity-70">Lowest temp</div>
            </button>
            <button
              onClick={() => setOptimization('balanced')}
              className={`text-xs px-3 py-2 rounded-lg transition-all ${
                optimization === 'balanced'
                  ? 'bg-heat-moderate/20 text-heat-moderate border border-heat-moderate'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              <div className="font-semibold">Balanced</div>
              <div className="text-xs opacity-70">Temp + speed</div>
            </button>
            <button
              onClick={() => setOptimization('speed')}
              className={`text-xs px-3 py-2 rounded-lg transition-all ${
                optimization === 'speed'
                  ? 'bg-heat-high/20 text-heat-high border border-heat-high'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              <div className="font-semibold">Speed</div>
              <div className="text-xs opacity-70">Fastest</div>
            </button>
          </div>
        </div>
        
        {/* Advanced Options */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center space-x-2 text-xs text-text-tertiary cursor-pointer">
            <input
              type="checkbox"
              checked={avoidExtreme}
              onChange={(e) => setAvoidExtreme(e.target.checked)}
              className="w-4 h-4 rounded border-border-primary text-primary-500 focus:ring-primary-500"
            />
            <span>Avoid extreme heat zones</span>
          </label>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={maxTemperature || ''}
              onChange={(e) => setMaxTemperature(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Max temp"
              className="w-20 bg-background-secondary border border-border-primary rounded-lg px-2 py-1 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-xs text-text-tertiary">°F</span>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-heat-extreme/10 text-heat-extreme rounded-lg text-sm mb-3">
            {error}
          </div>
        )}
        
        {/* Plan Route Button */}
        <button
          onClick={handlePlanRoute}
          disabled={!startLocation || !endLocation || isPending}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            !startLocation || !endLocation || isPending
              ? 'bg-background-tertiary text-text-tertiary cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-700 hover:to-primary-900'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Planning...
            </span>
          ) : (
            'Plan Safe Route'
          )}
        </button>
        
        {plannedRoute && (
          <button
            onClick={handleClearRoute}
            className="w-full py-2 mt-2 rounded-lg text-sm text-text-secondary hover:bg-background-tertiary transition-colors"
          >
            Clear Route
          </button>
        )}
      </div>
      
      {/* Route Result */}
      {plannedRoute && (
        <RouteResult route={plannedRoute} onClear={handleClearRoute} />
      )}
      
      {/* Current Temperature Warning */}
      {temperatureData && (
        <div className={`bg-background-card rounded-xl p-4 border border-${temperatureData.risk_level}-500/30`}>
          <div className="flex items-start space-x-3">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                temperatureData.risk_level === 'extreme' ? 'bg-heat-extreme/20 text-heat-extreme' :
                temperatureData.risk_level === 'high' ? 'bg-heat-high/20 text-heat-high' :
                temperatureData.risk_level === 'moderate' ? 'bg-heat-moderate/20 text-heat-moderate' :
                'bg-heat-low/20 text-heat-low'
              }`}
            >
              {temperatureData.temperature_f.toFixed(0)}°F
            </div>
            <div className="flex-1">
              <div className="text-xs text-text-tertiary mb-1">Current Conditions</div>
              <div className="text-sm font-semibold text-text-primary mb-1">
                {temperatureData.risk_level.toUpperCase()} RISK
              </div>
              <div className="text-xs text-text-secondary">
                {temperatureData.location}
              </div>
            </div>
          </div>
          
          {temperatureData.risk_level === 'extreme' && (
            <div className="mt-3 p-2 bg-heat-extreme/10 text-heat-extreme rounded-lg text-xs">
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Avoid outdoor activities - Extreme heat conditions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Route Result Component
// ============================================================================

interface RouteResultProps {
  route: PlannedRoute;
  onClear: () => void;
}

const RouteResult: React.FC<RouteResultProps> = ({ route, onClear }) => {
  const riskColor = RISK_COLORS[route.risk_level] || RISK_COLORS.moderate;
  
  return (
    <div className="bg-background-card rounded-xl p-4 border border-border-primary">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Route Planned Successfully!</h3>
          <div className="text-xs text-text-tertiary">
            {route.optimization.toUpperCase()} OPTIMIZATION
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Route Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-background-secondary rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {route.total_distance_km.toFixed(1)}<span className="text-lg">km</span>
          </div>
          <div className="text-xs text-text-tertiary mt-1">Distance</div>
        </div>
        <div className="bg-background-secondary rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {route.total_time_min.toFixed(0)}<span className="text-lg">min</span>
          </div>
          <div className="text-xs text-text-tertiary mt-1">Duration</div>
        </div>
        <div className="bg-background-secondary rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold text-${route.risk_level}`}>
            {route.risk_level.toUpperCase().substring(0, 3)}
          </div>
          <div className="text-xs text-text-tertiary mt-1">Risk</div>
        </div>
      </div>
      
      {/* Temperature Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background-secondary rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-text-primary">
            {route.avg_temperature.toFixed(0)}°F
          </div>
          <div className="text-xs text-text-tertiary mt-1">Avg Temperature</div>
        </div>
        <div className="bg-background-secondary rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-heat-extreme">
            {route.max_temperature.toFixed(0)}°F
          </div>
          <div className="text-xs text-text-tertiary mt-1">Max Temperature</div>
        </div>
      </div>
      
      {/* Route Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-tertiary">From:</span>
          <span className="font-medium text-text-primary">{route.start_location}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-tertiary">To:</span>
          <span className="font-medium text-text-primary">{route.end_location}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-tertiary">Segments:</span>
          <span className="font-medium text-text-primary">{route.segments.length}</span>
        </div>
      </div>
      
      {/* Alternative Routes */}
      {route.alternative_routes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-primary">
          <h4 className="text-sm font-semibold text-text-secondary mb-3">Alternative Routes</h4>
          <div className="space-y-2">
            {route.alternative_routes.slice(0, 2).map((alt, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg text-xs ${
                  alt.risk_level === 'low' ? 'bg-heat-low/10 text-heat-low' :
                  alt.risk_level === 'moderate' ? 'bg-heat-moderate/10 text-heat-moderate' :
                  'bg-background-secondary text-text-secondary'
                }`}
              >
                <div className="font-medium">{alt.route_name}</div>
                <div className="flex space-x-4">
                  <span>{alt.distance_km.toFixed(1)} km</span>
                  <span>{alt.estimated_time_min.toFixed(0)} min</span>
                  <span className="font-bold">{alt.avg_temperature.toFixed(0)}°F avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendation */}
      <div className="mt-4 p-3 bg-background-secondary rounded-lg">
        <div className="text-xs text-text-tertiary mb-1">Recommendation</div>
        <div className="text-sm text-text-primary">
          {route.risk_level === 'low' 
            ? 'This route is safe. Proceed normally.'
            : route.risk_level === 'moderate'
              ? 'Bring water and take breaks. Monitor conditions.'
              : route.risk_level === 'high'
                ? 'Route has high temperatures. Travel quickly and stay hydrated.'
                : 'Extreme temperatures on route. Consider alternative or delay travel.'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default RoutePlanner;
