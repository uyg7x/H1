// ============================================================================
// Location List Component
// Displays emergency locations grouped by type
// ============================================================================

import React from 'react';
import { EmergencyLocation } from '@/types';
import { LOCATION_TYPES, RISK_COLORS, RISK_LABELS } from '@/lib/constants';

interface LocationListProps {
  locations: Record<string, EmergencyLocation[]>;
  isLoading: boolean;
  onLocationSelect?: (location: EmergencyLocation) => void;
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
  isLoading,
  onLocationSelect,
}) => {
  // Filter out empty groups
  const filteredLocations = Object.entries(locations).filter(
    ([_, locs]) => locs.length > 0
  );
  
  // Sort by priority (from LOCATION_TYPES)
  const sortedLocations = filteredLocations.sort(([typeA], [typeB]) => {
    const priorityA = LOCATION_TYPES[typeA as keyof typeof LOCATION_TYPES]?.priority || 999;
    const priorityB = LOCATION_TYPES[typeB as keyof typeof LOCATION_TYPES]?.priority || 999;
    return priorityA - priorityB;
  });
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-background-tertiary rounded-lg mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-background-tertiary rounded-lg w-3/4"></div>
            <div className="h-4 bg-background-tertiary rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (sortedLocations.length === 0) {
    return (
      <div className="p-4 text-center text-text-tertiary">
        <svg className="w-12 h-12 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke="currentColor" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>No emergency locations found for this area</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      {sortedLocations.map(([type, locs]) => {
        const locationConfig = LOCATION_TYPES[type as keyof typeof LOCATION_TYPES];
        const riskCounts = {
          extreme: locs.filter((l) => l.risk_level === 'extreme').length,
          high: locs.filter((l) => l.risk_level === 'high').length,
          moderate: locs.filter((l) => l.risk_level === 'moderate').length,
          low: locs.filter((l) => l.risk_level === 'low').length,
        };
        
        return (
          <LocationGroup
            key={type}
            type={type}
            locations={locs}
            icon={locationConfig?.icon || '📍'}
            color={locationConfig?.color || '#3b82f6'}
            label={locationConfig?.label || type}
            riskCounts={riskCounts}
            onLocationSelect={onLocationSelect}
          />
        );
      })}
      
      {/* Summary */}
      <div className="bg-background-card rounded-xl p-4 border border-border-primary">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {sortedLocations.map(([type, locs]) => {
            const locationConfig = LOCATION_TYPES[type as keyof typeof LOCATION_TYPES];
            return (
              <div key={type} className="bg-background-secondary rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-text-primary">{locs.length}</div>
                <div className="text-xs text-text-tertiary mt-1">
                  {locationConfig?.label || type}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Location Group Component
// ============================================================================

interface LocationGroupProps {
  type: string;
  locations: EmergencyLocation[];
  icon: string;
  color: string;
  label: string;
  riskCounts: Record<string, number>;
  onLocationSelect?: (location: EmergencyLocation) => void;
}

const LocationGroup: React.FC<LocationGroupProps> = ({
  type,
  locations,
  icon,
  color,
  label,
  riskCounts,
  onLocationSelect,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(
    type === 'hospital' || type === 'cooling_center' || locations.length <= 3
  );
  
  // Sort locations by risk level (extreme first)
  const riskOrder: Record<string, number> = {
    critical: 0,
    extreme: 1,
    high: 2,
    moderate: 3,
    low: 4,
  };
  
  const sortedLocations = [...locations].sort(
    (a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]
  );
  
  // Get risk indicators
  const riskIndicators = [];
  if (riskCounts.extreme > 0) riskIndicators.push('🔴');
  if (riskCounts.high > 0) riskIndicators.push('🟠');
  if (riskCounts.moderate > 0) riskIndicators.push('🟡');
  if (riskCounts.low > 0) riskIndicators.push('🟢');
  
  return (
    <div className="bg-background-card rounded-xl border border-border-primary overflow-hidden">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-background-secondary transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="font-semibold text-text-primary">{label}</div>
            <div className="text-xs text-text-tertiary">{locations.length} locations</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {riskIndicators.length > 0 && (
            <div className="flex space-x-1">{riskIndicators.join('')}</div>
          )}
          <svg
            className={`w-5 h-5 text-text-tertiary transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none" viewBox="0 0 24 24"
          >
            <path stroke="currentColor" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Location List */}
      {isExpanded && (
        <div className="border-t border-border-primary">
          {sortedLocations.map((location, index) => {
            const riskColor = RISK_COLORS[location.risk_level] || RISK_COLORS.low;
            const riskLabel = RISK_LABELS[location.risk_level] || location.risk_level;
            
            return (
              <button
                key={`${type}-${location.id}-${index}`}
                onClick={() => onLocationSelect?.(location)}
                className={`w-full p-3 text-left hover:bg-background-secondary transition-colors border-b border-border-primary/50 ${
                  index === sortedLocations.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: riskColor.primary }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate">
                          {location.name}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-3">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      `bg-${location.risk_level}/20 text-${location.risk_level}`
                    }`}>
                      {location.temperature}°F
                    </div>
                  </div>
                </div>
                
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-xs text-text-secondary">
                    Risk: {riskLabel}
                  </span>
                  {location.capacity && (
                    <span className="text-xs text-text-secondary">
                      | Capacity: {location.capacity}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Location Card for Selected Location
// ============================================================================

interface LocationCardProps {
  location: EmergencyLocation;
  onClose: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onClose }) => {
  const riskColor = RISK_COLORS[location.risk_level] || RISK_COLORS.low;
  const riskLabel = RISK_LABELS[location.risk_level] || location.risk_level;
  const locationConfig = LOCATION_TYPES[location.type as keyof typeof LOCATION_TYPES];
  
  return (
    <div className="fixed bottom-20 left-4 z-50 w-[320px] bg-background-card border border-border-primary rounded-xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-border-primary flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary mb-1">{location.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span className="text-xl">{locationConfig?.icon || '📍'}</span>
            <span>{locationConfig?.label || location.type}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-background-secondary transition-colors">
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Temperature Card */}
        <div 
          className={`rounded-xl p-4 text-center ${
            riskColor.bg
          }`}
        >
          <div className="text-3xl font-bold" style={{ color: riskColor.primary }}>
            {location.temperature}°F
          </div>
          <div className="text-sm mt-1" style={{ color: riskColor.primary }}>
            {riskLabel}
          </div>
        </div>
        
        {/* Details */}
        <div className="space-y-3">
          {location.address && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke="currentColor" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-text-primary">{location.address}</span>
            </div>
          )}
          
          {location.contact && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-text-primary">{location.contact}</span>
            </div>
          )}
          
          {location.hours && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-text-primary">{location.hours}</span>
            </div>
          )}
          
          {location.capacity && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm text-text-primary">Capacity: {location.capacity}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Navigate Here
          </button>
          <button className="flex-1 py-2 bg-background-secondary hover:bg-background-tertiary text-sm font-semibold rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default LocationList;
