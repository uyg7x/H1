// ============================================================================
// Emergency Alert Bar Component
// Displays critical alerts at the top of the screen
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useEmergencyAlerts } from '@/hooks/useApi';
import { EmergencyAlert } from '@/types';
import { RISK_COLORS } from '@/lib/constants';

const EmergencyAlertBar: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  
  // Fetch emergency alerts for Phoenix (default)
  const { data: alerts = [], isLoading, error } = useEmergencyAlerts('Phoenix, AZ');
  
  // Filter for critical and high severity alerts
  useEffect(() => {
    if (!isLoading && !error) {
      const criticalAlerts = alerts.filter(
        (alert) => alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
      );
      setActiveAlerts(criticalAlerts);
    }
  }, [alerts, isLoading, error]);
  
  // Auto-hide after 10 seconds if no critical alerts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeAlerts.length === 0) {
        setIsVisible(false);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [activeAlerts.length]);
  
  // Show bar if there are critical alerts
  useEffect(() => {
    if (activeAlerts.length > 0) {
      setIsVisible(true);
    }
  }, [activeAlerts.length]);
  
  if (!isVisible || activeAlerts.length === 0) {
    return null;
  }
  
  // Determine severity level
  const hasCritical = activeAlerts.some((a) => a.severity === 'CRITICAL');
  const severity = hasCritical ? 'CRITICAL' : 'HIGH';
  const bgColor = hasCritical ? RISK_COLORS.extreme.primary : RISK_COLORS.high.primary;
  const textColor = hasCritical ? 'text-white' : 'text-white';
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white py-2 px-4 shadow-lg`}
      style={{
        background: `linear-gradient(90deg, ${bgColor} 0%, ${RISK_COLORS[hasCritical ? 'critical' : 'high'].primary} 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Alert Icon */}
          <div className="flex-shrink-0">
            {hasCritical ? (
              <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          
          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-bold uppercase tracking-wider">
                {severity} Alert
              </span>
              <span className="text-xs opacity-90">
                ({activeAlerts.length} active)
              </span>
            </div>
            <div className="text-sm truncate">
              {activeAlerts[0]?.message || 'Emergency heat conditions detected'}
            </div>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"
          title="Dismiss"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Alert Details Dropdown */}
      <div className="max-w-7xl mx-auto mt-1">
        {activeAlerts.map((alert) => (
          <div 
            key={alert.alert_id}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 mb-1 text-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-xs uppercase opacity-90 mb-1">
                  {alert.alert_type}
                </div>
                <div className="text-xs">
                  {alert.message}
                </div>
                {alert.actions.length > 0 && (
                  <div className="mt-2 text-xs opacity-80">
                    Actions: {alert.actions.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 ml-3">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  alert.severity === 'CRITICAL' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/30 text-white'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default EmergencyAlertBar;
