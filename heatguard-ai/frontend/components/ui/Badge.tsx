// ==========================================================================
// HeatGuard AI - Badge Component
// Production-grade badge components for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import { RiskLevel } from '../../lib/types';
import { RISK_COLORS, RISK_THRESHOLDS } from '../../lib/mockData';

// ==========================================================================
// Base Badge Props
// ==========================================================================

interface BaseBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================================================
// Main Badge Component
// ==========================================================================

const Badge: React.FC<BaseBadgeProps> = ({
  children,
  className = '',
  variant = 'solid',
  size = 'md',
}) => {
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-0.5 text-xs';
      case 'md': return 'px-3 py-1 text-sm';
      case 'lg': return 'px-4 py-2 text-base';
      default: return 'px-3 py-1 text-sm';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'solid': return 'bg-blue-600 text-white';
      case 'outline': return 'border border-blue-600 text-blue-600';
      case 'ghost': return 'text-blue-600';
      case 'subtle': return 'bg-blue-600/10 text-blue-600';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${getSizeClasses()} ${getVariantClasses()} ${className}`}
    >
      {children}
    </span>
  );
};

// ==========================================================================
// Risk Level Badge
// ==========================================================================

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const riskIcons: Record<RiskLevel, string> = {
  low: '✓',
  moderate: '⚠',
  high: '⚠️',
  extreme: '🔥',
};

const riskLabels: Record<RiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  extreme: 'Extreme',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskLevel,
  showLabel = true,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const colors = RISK_COLORS[riskLevel];

  return (
    <Badge 
      className={className}
      size={size}
      variant="solid"
      style={{
        backgroundColor: colors.primary,
        color: 'white',
      }}
    >
      {showIcon && <span className="mr-1">{riskIcons[riskLevel]}</span>}
      {showLabel && riskLabels[riskLevel]}
    </Badge>
  );
};

// ==========================================================================
// Status Badge
// ==========================================================================

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'success';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColors = {
  online: { bg: '#10b981', text: 'white' },
  offline: { bg: '#6b7280', text: 'white' },
  warning: { bg: '#f59e0b', text: 'white' },
  error: { bg: '#ef4444', text: 'white' },
  success: { bg: '#10b981', text: 'white' },
};

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
};

const statusIcons = {
  online: '●',
  offline: '○',
  warning: '⚠',
  error: '✕',
  success: '✓',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const colors = statusColors[status];
  const displayLabel = label || statusLabels[status];

  return (
    <Badge 
      className={className}
      size={size}
      variant="solid"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <span className="mr-1">{statusIcons[status]}</span>
      {displayLabel}
    </Badge>
  );
};

// ==========================================================================
// Temperature Badge
// ==========================================================================

interface TemperatureBadgeProps {
  temperature: number;
  riskLevel: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TemperatureBadge: React.FC<TemperatureBadgeProps> = ({
  temperature,
  riskLevel,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const colors = RISK_COLORS[riskLevel];

  return (
    <Badge 
      className={className}
      size={size}
      variant="solid"
      style={{
        backgroundColor: colors.primary,
        color: 'white',
      }}
    >
      {showIcon && <span className="mr-1">🌡️</span>}
      {temperature}°F
    </Badge>
  );
};

// ==========================================================================
// Zone Badge
// ==========================================================================

interface ZoneBadgeProps {
  zone: string;
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ZoneBadge: React.FC<ZoneBadgeProps> = ({
  zone,
  riskLevel,
  size = 'md',
  className = '',
}) => {
  const colors = RISK_COLORS[riskLevel];

  return (
    <Badge 
      className={className}
      size={size}
      variant="subtle"
      style={{
        backgroundColor: `${colors.primary}20`,
        color: colors.primary,
        border: `1px solid ${colors.light}`
      }}
    >
      <span className="mr-1">📍</span>
      {zone}
    </Badge>
  );
};

// ==========================================================================
// Count Badge (for notifications)
// ==========================================================================

interface CountBadgeProps {
  count: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  color = '#ef4444',
  size = 'sm',
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge 
      className={className}
      size={size}
      variant="solid"
      style={{
        backgroundColor: color,
        color: 'white',
        minWidth: '20px',
        justifyContent: 'center',
      }}
    >
      {displayCount}
    </Badge>
  );
};

// ==========================================================================
// Pulse Badge (for live/active indicators)
// ==========================================================================

interface PulseBadgeProps {
  isActive: boolean;
  label: string;
  activeColor?: string;
  inactiveColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseBadge: React.FC<PulseBadgeProps> = ({
  isActive,
  label,
  activeColor = '#10b981',
  inactiveColor = '#6b7280',
  size = 'md',
  className = '',
}) => {
  return (
    <Badge 
      className={className}
      size={size}
      variant="subtle"
      style={{
        backgroundColor: isActive ? `${activeColor}20` : `${inactiveColor}20`,
        color: isActive ? activeColor : inactiveColor,
        border: `1px solid ${isActive ? activeColor : inactiveColor}`
      }}
    >
      <span 
        className={`mr-2 w-2 h-2 rounded-full ${isActive ? 'bg-current animate-pulse' : 'bg-current'}`}
        style={{ color: isActive ? activeColor : inactiveColor }}
      />
      {label}
    </Badge>
  );
};

// ==========================================================================
// Gradient Badge
// ==========================================================================

interface GradientBadgeProps {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GradientBadge: React.FC<GradientBadgeProps> = ({
  children,
  fromColor,
  toColor,
  size = 'md',
  className = '',
}) => {
  return (
    <Badge 
      className={className}
      size={size}
      variant="solid"
      style={{
        background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
        color: 'white',
      }}
    >
      {children}
    </Badge>
  );
};

// ==========================================================================
// Export
// ==========================================================================

export default Badge;