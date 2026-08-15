// ==========================================================================
// HeatGuard AI - KPI Card Component
// Production-grade KPI display for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import { RiskLevel } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// KPI Card Props
// ==========================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  riskLevel?: RiskLevel;
  color?: string;
  className?: string;
}

// ==========================================================================
// Risk Level Badge Component
// ==========================================================================

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel, className = '' }) => {
  const colors = RISK_COLORS[riskLevel];
  
  const riskLabels = {
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Risk',
    extreme: 'Extreme Risk',
  };

  return (
    <span 
      className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        backgroundColor: `${colors.light}20`,
        color: colors.primary,
        border: `1px solid ${colors.light}`
      }}
    >
      {riskLabels[riskLevel]}
    </span>
  );
};

// ==========================================================================
// Trend Indicator Component
// ==========================================================================

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  value?: string;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, value, className = '' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      case 'stable': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${getTrendColor()} ${className}`}>
      <span className="text-xs">{getTrendIcon()}</span>
      {value && <span className="text-xs">{value}</span>}
    </div>
  );
};

// ==========================================================================
// Main KPI Card Component
// ==========================================================================

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  riskLevel,
  color,
  className = '',
}) => {
  // Determine color based on risk level or custom color
  const getCardColor = () => {
    if (color) return color;
    if (riskLevel) return RISK_COLORS[riskLevel].primary;
    return '#3b82f6'; // Default blue
  };

  // Format value based on type
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val > 1000) {
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(val);
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div 
      className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 transition-all hover:shadow-xl ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {title}
            </h3>
            {riskLevel && <RiskBadge riskLevel={riskLevel} />}
          </div>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${getCardColor()}20` }}>
            {React.cloneElement(icon as React.ReactElement, {
              className: 'w-5 h-5',
              style: { color: getCardColor() }
            })}
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2 mb-2">
        <p className="text-3xl font-bold" style={{ color: getCardColor() }}>
          {formatValue(value)}
        </p>
        {typeof value === 'number' && <span className="text-sm text-gray-400">°F</span>}
      </div>

      {trend && (
        <div className="flex items-center space-x-2">
          <TrendIndicator trend={trend} value={trendValue} />
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// Temperature KPI Card (Specialized)
// ==========================================================================

interface TemperatureKPICardProps {
  temperature: number;
  riskLevel: RiskLevel;
  location: string;
  className?: string;
}

export const TemperatureKPICard: React.FC<TemperatureKPICardProps> = ({
  temperature,
  riskLevel,
  location,
  className = '',
}) => {
  const colors = RISK_COLORS[riskLevel];

  return (
    <div 
      className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 ${className}`}
      style={{
        borderColor: colors.primary,
        boxShadow: `0 0 20px ${colors.primary}40`
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
            Current Temperature
          </h3>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
          <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M12 2v20M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path stroke="currentColor" strokeWidth={2} d="M12 6v6M12 18v-6" />
          </svg>
        </div>
      </div>

      <div className="flex items-baseline space-x-2 mb-4">
        <p className="text-4xl font-bold" style={{ color: colors.primary }}>
          {temperature.toFixed(1)}
        </p>
        <span className="text-xl" style={{ color: colors.primary }}>°F</span>
      </div>

      <div className="flex items-center justify-between">
        <RiskBadge riskLevel={riskLevel} />
        <div className="text-xs text-gray-500">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// Stat Card (Simpler version)
// ==========================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = '#6b7280',
  className = '',
}) => {
  return (
    <div className={`bg-gray-700/50 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            {React.cloneElement(icon as React.ReactElement, {
              className: 'w-4 h-4',
              style: { color }
            })}
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// Export
// ==========================================================================

export default KPICard;