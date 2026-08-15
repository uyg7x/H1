// ============================================================================
// Sidebar Component
// Contains city selector, temperature info, and route planner
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTemperatureData, useHeatMapData, useEmergencyAlerts, usePlanRouteMutation } from '@/hooks/useApi';
import { RISK_COLORS, RISK_LABELS, LOCATION_TYPES } from '@/lib/constants';
import { RouteOptimization, EmergencyLocation } from '@/types';
import RoutePlanner from './planner/RoutePlanner';
import LocationList from './locations/LocationList';
import StatisticsPanel from './stats/StatisticsPanel';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onThemeToggle }) => {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('Phoenix, AZ');
  const [activeTab, setActiveTab] = useState<'info' | 'route' | 'locations' | 'stats'>('info');
  
  // Fetch data based on selected city
  const { data: temperatureData, isLoading: isLoadingTemp } = useTemperatureData(selectedCity);
  const { data: heatMapData, isLoading: isLoadingMap } = useHeatMapData(selectedCity);
  const { data: alerts, isLoading: isLoadingAlerts } = useEmergencyAlerts(selectedCity);
  
  const isLoading = isLoadingTemp || isLoadingMap || isLoadingAlerts;
  
  // Handle city change
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setActiveTab('info');
  };
  
  // Available cities
  const cities = [
    'Phoenix, AZ',
    'Las Vegas, NV',
    'Los Angeles, CA',
    'Houston, TX',
    'Miami, FL',
    'New York, NY',
    'Chicago, IL',
    'Atlanta, GA',
  ];
  
  // Get risk color
  const getRiskColor = (level: string) => RISK_COLORS[level as keyof typeof RISK_COLORS] || RISK_COLORS.low;
  
  // Emergency locations by type
  const groupLocationsByType = (locations: EmergencyLocation[] = []) => {
    const grouped: Record<string, EmergencyLocation[]> = {};
    Object.keys(LOCATION_TYPES).forEach((type) => {
      grouped[type] = locations.filter((loc) => loc.type === type);
    });
    return grouped;
  };
  
  const emergencyLocations = heatMapData?.emergency_locations || [];
  const groupedLocations = groupLocationsByType(emergencyLocations);
  
  // Critical alerts
  const criticalAlerts = alerts?.filter((a) => a.severity === 'CRITICAL') || [];
  
  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-full bg-background-secondary border-r border-border-primary flex flex-col transition-all duration-300 ${
        isOpen ? 'w-[320px]' : 'w-0 md:w-[64px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 bg-gradient-to-br from-heat-extreme to-heat-high rounded-lg flex items-center justify-center transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'
          }`}>
            <span className="text-white font-bold text-sm">HG</span>
          </div>
          <span className={`font-bold text-text-primary transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'
          }`}>
            HeatGuard
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-background-tertiary transition-colors"
        >
          <svg className={`w-5 h-5 text-text-primary transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* City Selector */}
      <div className="p-4 border-b border-border-primary">
        <label className="block text-xs font-semibold text-text-tertiary mb-2">
          Select City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full bg-background-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          disabled={isLoading}
        >
          {cities.map((city) => (
            <option key={city} value={city} className="bg-background-secondary">
              {city}
            </option>
          ))}
        </select>
      </div>
      
      {/* Tab Navigation */}
      <div className="p-2 border-b border-border-primary flex space-x-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'info' 
              ? 'bg-primary-600 text-white' 
              : 'text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          Temperature
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'route' 
              ? 'bg-primary-600 text-white' 
              : 'text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          Route
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'locations' 
              ? 'bg-primary-600 text-white' 
              : 'text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          Locations
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'stats' 
              ? 'bg-primary-600 text-white' 
              : 'text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          Stats
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' && (
          <TemperatureInfoPanel 
            data={temperatureData} 
            isLoading={isLoading} 
            alerts={alerts || []}
          />
        )}
        
        {activeTab === 'route' && (
          <RoutePlanner 
            city={selectedCity}
            temperatureData={temperatureData}
          />
        )}
        
        {activeTab === 'locations' && (
          <LocationList 
            locations={groupedLocations} 
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'stats' && (
          <StatisticsPanel 
            heatMapData={heatMapData}
            temperatureData={temperatureData}
            isLoading={isLoading}
          />
        )}
      </div>
    </aside>
  );
};

// ============================================================================
// Temperature Info Panel
// ============================================================================

interface TemperatureInfoPanelProps {
  data: any;
  isLoading: boolean;
  alerts: any[];
}

const TemperatureInfoPanel: React.FC<TemperatureInfoPanelProps> = ({ data, isLoading, alerts }) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-background-tertiary rounded-lg mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-background-tertiary rounded-lg w-3/4"></div>
            <div className="h-4 bg-background-tertiary rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4 text-center text-text-tertiary">
        No temperature data available
      </div>
    );
  }
  
  const riskColor = RISK_COLORS[data.risk_level as keyof typeof RISK_COLORS] || RISK_COLORS.low;
  const riskLabel = RISK_LABELS[data.risk_level] || data.risk_level;
  
  return (
    <div className="p-4 space-y-4">
      {/* Temperature Card */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-secondary">Current Conditions</h3>
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            `bg-${data.risk_level}/20 text-${data.risk_level}`
          }`}>
            {riskLabel}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                data.risk_level === 'extreme' ? 'bg-gradient-to-br from-heat-extreme to-heat-high shadow-glow-red' :
                data.risk_level === 'high' ? 'bg-gradient-to-br from-heat-high to-heat-moderate shadow-glow-orange' :
                data.risk_level === 'moderate' ? 'bg-gradient-to-br from-heat-moderate to-heat-low' :
                'bg-gradient-to-br from-heat-low to-heat-safe'
              }`}
              style={{ boxShadow: `0 0 20px ${riskColor}/50` }}
            >
              <span className="text-white drop-shadow-md">
                {data.temperature_f.toFixed(0)}°F
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-text-tertiary">Temperature</div>
            <div className="text-2xl font-bold text-text-primary">
              {data.temperature_f.toFixed(1)}°F
            </div>
            <div className="text-xs text-text-tertiary">
              Feels like: {data.heat_index?.toFixed(1) || 'N/A'}°F
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="text-center">
            <div className="text-xs text-text-tertiary">Humidity</div>
            <div className="font-semibold text-text-primary">{data.humidity || 'N/A'}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-tertiary">Risk Level</div>
            <div className={`font-semibold text-${data.risk_level}`}>
              {riskLabel}
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-background-card rounded-xl p-4 border border-border-primary">
          <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-heat-extreme" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Active Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.alert_id}
                className={`p-2 rounded-lg text-xs ${
                  alert.severity === 'CRITICAL' ? 'bg-heat-extreme/10 text-heat-extreme' :
                  alert.severity === 'HIGH' ? 'bg-heat-high/10 text-heat-high' :
                  'bg-heat-moderate/10 text-heat-moderate'
                }`}
              >
                <div className="font-semibold">{alert.alert_type}</div>
                <div className="text-text-secondary">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Location Info */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">Location</h3>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke="currentColor" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-text-primary">{data.location}</span>
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          Data resolution: {data.resolution}
        </div>
        <div className="text-xs text-text-tertiary">
          Measured at: {data.measured_at}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Sidebar;
