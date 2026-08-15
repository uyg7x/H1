// ============================================================================
// Statistics Panel Component
// Displays comprehensive statistics and analytics
// ============================================================================

import React from 'react';
import { TemperatureData, HeatMapData } from '@/types';
import { RISK_COLORS, TEMPERATURE_THRESHOLDS } from '@/lib/constants';

interface StatisticsPanelProps {
  heatMapData?: HeatMapData;
  temperatureData?: TemperatureData;
  isLoading: boolean;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  heatMapData,
  temperatureData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-background-tertiary rounded-lg mb-2"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-20 bg-background-tertiary rounded-lg"></div>
            <div className="h-20 bg-background-tertiary rounded-lg"></div>
            <div className="h-20 bg-background-tertiary rounded-lg"></div>
            <div className="h-20 bg-background-tertiary rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!heatMapData && !temperatureData) {
    return (
      <div className="p-4 text-center text-text-tertiary">
        No statistics available
      </div>
    );
  }
  
  // Calculate statistics
  const routeOptions = heatMapData?.route_options ?? [];
  const emergencyLocs = heatMapData?.emergency_locations ?? [];
  const stats = {
    location: temperatureData?.location || 'N/A',
    temperature: temperatureData?.temperature_f || 0,
    riskLevel: temperatureData?.risk_level || 'unknown',
    humidity: temperatureData?.humidity || 0,
    heatIndex: temperatureData?.heat_index || 0,

    // From heat map data
    emergencyLocations: emergencyLocs,
    routeOptions: routeOptions,

    // Calculated metrics
    avgRouteTemperature: routeOptions.length > 0
      ? routeOptions.reduce((sum, route) => sum + route.avg_temperature, 0) / routeOptions.length
      : 0,
    minRouteTemperature: routeOptions.length > 0
      ? Math.min(...routeOptions.map(r => r.avg_temperature))
      : 0,
    maxRouteTemperature: routeOptions.length > 0
      ? Math.max(...routeOptions.map(r => r.max_temperature))
      : 0,

    // Emergency location metrics
    totalHospitals: emergencyLocs.filter(l => l.type === 'hospital').length,
    totalCoolingCenters: emergencyLocs.filter(l => l.type === 'cooling_center').length,
    totalFireStations: emergencyLocs.filter(l => l.type === 'fire_station').length,

    // Temperature distribution
    tempInExtremeZones: emergencyLocs.filter(l => l.risk_level === 'extreme').length,
    tempInHighZones: emergencyLocs.filter(l => l.risk_level === 'high').length,
    tempInModerateZones: emergencyLocs.filter(l => l.risk_level === 'moderate').length,
    tempInLowZones: emergencyLocs.filter(l => l.risk_level === 'low').length,
  };
  
  // Risk assessment
  const getRiskAssessment = () => {
    if (stats.temperature >= TEMPERATURE_THRESHOLDS.EXTREME) {
      return {
        level: 'Critical',
        color: RISK_COLORS.extreme.primary,
        bgColor: RISK_COLORS.extreme.bg,
        description: 'Immediate action required. Activate all emergency protocols.',
        recommendations: [
          'Activate all cooling centers',
          'Deploy emergency services',
          'Issue public safety alerts',
          'Evacuate vulnerable populations',
        ],
      };
    } else if (stats.temperature >= TEMPERATURE_THRESHOLDS.HIGH) {
      return {
        level: 'High',
        color: RISK_COLORS.high.primary,
        bgColor: RISK_COLORS.high.bg,
        description: 'High risk conditions. Monitor closely and prepare for escalation.',
        recommendations: [
          'Open all cooling centers',
          'Increase patrols in high-risk areas',
          'Monitor vulnerable populations',
          'Prepare emergency resources',
        ],
      };
    } else if (stats.temperature >= TEMPERATURE_THRESHOLDS.MODERATE) {
      return {
        level: 'Moderate',
        color: RISK_COLORS.moderate.primary,
        bgColor: RISK_COLORS.moderate.bg,
        description: 'Elevated risk. Maintain vigilance and preparedness.',
        recommendations: [
          'Ensure cooling centers are ready',
          'Monitor weather forecasts',
          'Distribute heat safety information',
          'Prepare for potential escalation',
        ],
      };
    } else {
      return {
        level: 'Low',
        color: RISK_COLORS.low.primary,
        bgColor: RISK_COLORS.low.bg,
        description: 'Normal conditions. Continue routine monitoring.',
        recommendations: [
          'Maintain standard operations',
          'Continue routine monitoring',
          'No immediate action required',
        ],
      };
    }
  };
  
  const riskAssessment = getRiskAssessment();
  
  return (
    <div className="p-4 space-y-4">
      {/* Risk Assessment Card */}
      <div 
        className={`rounded-xl p-4 border border-${stats.riskLevel}-500/30`}
        style={{ background: riskAssessment.bgColor }}
      >
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Risk Assessment</h3>
        
        <div className="flex items-center space-x-4">
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              `bg-${stats.riskLevel}/20`
            }`}
            style={{ color: riskAssessment.color }}
          >
            <span className="drop-shadow-md">{stats.temperature.toFixed(0)}°F</span>
          </div>
          
          <div className="flex-1">
            <div className={`font-bold text-xl ${`text-${stats.riskLevel}`}`}>
              {riskAssessment.level}
            </div>
            <div className="text-xs text-text-secondary">
              {stats.riskLevel.toUpperCase()} RISK
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-background-secondary/50 rounded-lg">
          <div className="text-xs text-text-tertiary mb-1">Description</div>
          <div className="text-sm text-text-primary">
            {riskAssessment.description}
          </div>
        </div>
      </div>
      
      {/* Temperature Metrics */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Temperature Metrics</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-heat-extreme">
              {stats.maxRouteTemperature.toFixed(0)}°F
            </div>
            <div className="text-xs text-text-tertiary mt-1">Max Route Temp</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-heat-moderate">
              {stats.avgRouteTemperature.toFixed(0)}°F
            </div>
            <div className="text-xs text-text-tertiary mt-1">Avg Route Temp</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-heat-low">
              {stats.minRouteTemperature.toFixed(0)}°F
            </div>
            <div className="text-xs text-text-tertiary mt-1">Min Route Temp</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {stats.humidity}%
            </div>
            <div className="text-xs text-text-tertiary mt-1">Humidity</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {stats.heatIndex.toFixed(0)}°F
            </div>
            <div className="text-xs text-text-tertiary mt-1">Feels Like</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {temperatureData?.credits_remaining.toLocaleString()}
            </div>
            <div className="text-xs text-text-tertiary mt-1">API Credits</div>
          </div>
        </div>
      </div>
      
      {/* Emergency Locations Summary */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Emergency Locations</h3>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-background-secondary rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-500">🏥</div>
            <div className="text-xs text-text-primary mt-1">{stats.totalHospitals}</div>
            <div className="text-xs text-text-tertiary">Hospitals</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-cyan-500">❄️</div>
            <div className="text-xs text-text-primary mt-1">{stats.totalCoolingCenters}</div>
            <div className="text-xs text-text-tertiary">Cooling</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-orange-500">🚒</div>
            <div className="text-xs text-text-primary mt-1">{stats.totalFireStations}</div>
            <div className="text-xs text-text-tertiary">Fire</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-500">📍</div>
            <div className="text-xs text-text-primary mt-1">{stats.emergencyLocations.length}</div>
            <div className="text-xs text-text-tertiary">Total</div>
          </div>
        </div>
      </div>
      
      {/* Temperature Distribution */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Temperature Distribution</h3>
        
        <div className="space-y-2">
          {[
            { label: 'Extreme Zones', count: stats.tempInExtremeZones, level: 'extreme', color: RISK_COLORS.extreme.primary },
            { label: 'High Zones', count: stats.tempInHighZones, level: 'high', color: RISK_COLORS.high.primary },
            { label: 'Moderate Zones', count: stats.tempInModerateZones, level: 'moderate', color: RISK_COLORS.moderate.primary },
            { label: 'Safe Zones', count: stats.tempInLowZones, level: 'low', color: RISK_COLORS.low.primary },
          ].map((item) => (
            <div key={item.label} className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="text-sm text-text-primary">{item.label}</div>
              </div>
              <div className="text-sm font-semibold text-text-primary">{item.count}</div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex space-x-1">
            <div 
              className="h-2 rounded-full"
              style={{
                width: `${(stats.tempInExtremeZones / stats.emergencyLocations.length * 100) || 0}%`,
                backgroundColor: RISK_COLORS.extreme.primary,
              }}
            />
            <div 
              className="h-2 rounded-full"
              style={{
                width: `${(stats.tempInHighZones / stats.emergencyLocations.length * 100) || 0}%`,
                backgroundColor: RISK_COLORS.high.primary,
              }}
            />
            <div 
              className="h-2 rounded-full"
              style={{
                width: `${(stats.tempInModerateZones / stats.emergencyLocations.length * 100) || 0}%`,
                backgroundColor: RISK_COLORS.moderate.primary,
              }}
            />
            <div 
              className="h-2 rounded-full"
              style={{
                width: `${(stats.tempInLowZones / stats.emergencyLocations.length * 100) || 0}%`,
                backgroundColor: RISK_COLORS.low.primary,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary mt-1">
            <span>Extreme</span>
            <span>High</span>
            <span>Moderate</span>
            <span>Safe</span>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Recommendations</h3>
        
        <div className="space-y-2">
          {riskAssessment.recommendations.map((rec, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-2 bg-background-secondary rounded-lg"
            >
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">{index + 1}</span>
              </div>
              <div className="text-sm text-text-primary">{rec}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default StatisticsPanel;
