// ==========================================================================
// HeatGuard AI - Temperature Bar Chart
// Production-grade bar chart for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { RiskLevel, BarChartData } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// Temperature Bar Chart Props
// ==========================================================================

interface TempBarChartProps {
  data: BarChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

// ==========================================================================
// Custom Tooltip Component
// ==========================================================================

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const riskLevel: RiskLevel = data.risk_level || 'low';
    const colors = RISK_COLORS[riskLevel];

    return (
      <div className="bg-background-card border border-border-primary rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-lg font-bold" style={{ color: colors.primary }}>
          {data.value}°F
        </p>
        <p className="text-xs text-text-secondary">
          Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================================================
// Risk Level Color Mapping
// ==========================================================================

const getRiskColor = (riskLevel?: RiskLevel) => {
  if (!riskLevel) return RISK_COLORS.low.primary;
  return RISK_COLORS[riskLevel].primary;
};

// ==========================================================================
// Custom Bar Component with Gradient
// ==========================================================================

const CustomBar: React.FC<any> = (props: any) => {
  const { x, y, width, height, fill, payload } = props;
  const riskLevel: RiskLevel = payload.risk_level || 'low';
  const colors = RISK_COLORS[riskLevel];

  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${props.index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
          <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#gradient-${props.index})`}
        rx={4}
        ry={4}
      />
      {/* Add temperature label on top of bar */}
      {height > 20 && (
        <text
          x={x + width / 2}
          y={y + height - 5}
          fill="white"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
        >
          {payload.value}°
        </text>
      )}
    </g>
  );
};

// ==========================================================================
// Main Temperature Bar Chart Component
// ==========================================================================

const TempBarChart: React.FC<TempBarChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  className = '',
}) => {
  // Sort data by value for better visualization
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  return (
    <div className={`bg-background-card border border-border-primary rounded-xl p-6 shadow-lg ${className}`}>
      {/* Chart Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={showGrid ? 0.3 : 0}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${value}°F`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
            )}
            <Bar
              dataKey="value"
              name="Temperature (°F)"
              shape={<CustomBar />}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {(['extreme', 'high', 'moderate', 'low'] as RiskLevel[]).map((level) => {
          const colors = RISK_COLORS[level];
          return (
            <div key={level} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-xs text-text-secondary">
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================================================
// Hourly Temperature Bar Chart (Specialized)
// ==========================================================================

interface HourlyBarChartProps {
  data: BarChartData[];
  currentHour?: string;
  className?: string;
}

export const HourlyBarChart: React.FC<HourlyBarChartProps> = ({
  data,
  currentHour,
  className = '',
}) => {
  // Highlight current hour
  const formattedData = data.map(item => ({
    ...item,
    isCurrent: item.name === currentHour,
  }));

  return (
    <TempBarChart
      data={formattedData}
      title="24-Hour Temperature Forecast"
      subtitle="Peak heat times and risk levels"
      height={250}
      showLegend={false}
      className={className}
    />
  );
};

// ==========================================================================
// Zone Comparison Bar Chart
// ==========================================================================

interface ZoneBarChartProps {
  data: BarChartData[];
  className?: string;
}

export const ZoneBarChart: React.FC<ZoneBarChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <TempBarChart
      data={data}
      title="Temperature by Zone"
      subtitle="Current temperature distribution across city zones"
      height={300}
      showLegend={false}
      className={className}
    />
  );
};

// All exports are inline above (export default TempBarChart + export const HourlyBarChart / ZoneBarChart).
// No trailing export block — keeps the file duplicate-free.