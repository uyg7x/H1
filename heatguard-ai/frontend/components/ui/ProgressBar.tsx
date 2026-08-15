// ==========================================================================
// HeatGuard AI - Progress Bar Component
// Production-grade progress indicators for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import { RiskLevel } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// Progress Bar Props
// ==========================================================================

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  color?: string;
  riskLevel?: RiskLevel;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==========================================================================
// Main Progress Bar Component
// ==========================================================================

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color,
  riskLevel,
  showPercentage = true,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  // Clamp value between 0 and max
  const clampedValue = Math.min(max, Math.max(0, value));
  const percentage = (clampedValue / max) * 100;

  // Determine color
  const getBarColor = () => {
    if (color) return color;
    if (riskLevel) return RISK_COLORS[riskLevel].primary;
    return '#3b82f6'; // Default blue
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'md': return 'h-3';
      case 'lg': return 'h-4';
      default: return 'h-3';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold" style={{ color: getBarColor() }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className="w-full bg-gray-700/50 rounded-full overflow-hidden border border-gray-700">
        <div
          className={`rounded-full transition-all duration-500 ease-out ${getSizeClasses()}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: getBarColor(),
            backgroundImage: `linear-gradient(90deg, ${getBarColor()} 0%, ${getBarColor()}dd 100%)`,
          }}
        />
      </div>

      {!showLabel && showPercentage && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// Circular Progress Component
// ==========================================================================

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  riskLevel?: RiskLevel;
  showPercentage?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 60,
  strokeWidth = 6,
  color,
  riskLevel,
  showPercentage = true,
  children,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (riskLevel) return RISK_COLORS[riskLevel].primary;
    return '#3b82f6';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        {children || (
          <span className="text-lg font-bold" style={{ color: getColor() }}>
            {showPercentage ? `${Math.round(clampedValue)}%` : clampedValue}
          </span>
        )}
      </div>
    </div>
  );
};

// ==========================================================================
// Risk Level Progress Bar (Specialized)
// ==========================================================================

interface RiskProgressBarProps {
  riskLevel: RiskLevel;
  value: number;
  label: string;
  className?: string;
}

export const RiskProgressBar: React.FC<RiskProgressBarProps> = ({
  riskLevel,
  value,
  label,
  className = '',
}) => {
  const colors = RISK_COLORS[riskLevel];

  return (
    <div className={`bg-gray-700/50 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white">{label}</span>
        <span 
          className="text-sm font-bold px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${colors.primary}20`,
            color: colors.primary
          }}
        >
          {riskLevel.toUpperCase()}
        </span>
      </div>
      <ProgressBar
        value={value}
        color={colors.primary}
        showPercentage
        showLabel={false}
      />
    </div>
  );
};

// ==========================================================================
// Multi-Color Progress Bar (for risk distribution)
// ==========================================================================

interface MultiProgressBarProps {
  segments: {
    value: number;
    color: string;
    label?: string;
  }[];
  max?: number;
  className?: string;
}

export const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  segments,
  max = 100,
  className = '',
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const scale = max / total;

  return (
    <div className={`w-full bg-gray-700/50 rounded-full overflow-hidden border border-gray-700 ${className}`}>
      <div className="flex h-full">
        {segments.map((segment, index) => {
          const scaledValue = segment.value * scale;
          return (
            <div
              key={index}
              className="transition-all duration-500 ease-out"
              style={{
                width: `${scaledValue}%`,
                backgroundColor: segment.color,
              }}
              title={segment.label}
            />
          );
        })}
      </div>
    </div>
  );
};

// ==========================================================================
// Animated Progress Bar
// ==========================================================================

interface AnimatedProgressBarProps extends ProgressBarProps {
  animateOnMount?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  animateOnMount = true,
  ...props
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animateOnMount]);

  return <ProgressBar {...props} value={displayValue} />;
};

// ==========================================================================
// Export
// ==========================================================================

export default ProgressBar;