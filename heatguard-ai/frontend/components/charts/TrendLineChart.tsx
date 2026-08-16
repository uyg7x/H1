// ==========================================================================
// HeatGuard AI - Temperature Trend Line Chart
// Production-grade line chart for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { RiskLevel, LineChartData } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// Trend Line Chart Props
// ==========================================================================

interface TrendLineChartProps {
  data: LineChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  showLegend?: boolean;
  showReferenceLines?: boolean;
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
          {data.temperature}°F
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
// Custom Dot Component
// ==========================================================================

const CustomDot: React.FC<any> = (props: any) => {
  const { cx, cy, payload, value, index } = props;
  const riskLevel: RiskLevel = payload.risk_level || 'low';
  const colors = RISK_COLORS[riskLevel];

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={colors.primary}
        stroke="white"
        strokeWidth={2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={colors.primary}
        opacity={0.2}
      />
    </g>
  );
};

// ==========================================================================
// Custom Active Dot Component
// ==========================================================================

const CustomActiveDot: React.FC<any> = (props: any) => {
  const { cx, cy, payload } = props;
  const riskLevel: RiskLevel = payload.risk_level || 'low';
  const colors = RISK_COLORS[riskLevel];

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={colors.primary}
        stroke="white"
        strokeWidth={3}
      />
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill={colors.primary}
        opacity={0.3}
      />
    </g>
  );
};

// ==========================================================================
// Main Trend Line Chart Component
// ==========================================================================

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  showArea = false,
  showLegend = true,
  showReferenceLines = true,
  className = '',
}) => {
  // Sort data by name (date)
  const sortedData = [...data].sort((a, b) => {
    // Handle date strings like "Aug 8", "Aug 9", etc.
    const dateA = new Date(a.name).getTime();
    const dateB = new Date(b.name).getTime();
    return dateA - dateB;
  });

  // Get risk threshold values
  const thresholds = {
    extreme: 106,
    high: 96,
    moderate: 86,
    low: 85,
  };

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
          {showArea ? (
            <ComposedChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  formatter={(value) => value}
                />
              )}
              {showReferenceLines && (
                <>
                  <ReferenceLine 
                    y={thresholds.extreme} 
                    stroke={RISK_COLORS.extreme.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'Extreme', fill: RISK_COLORS.extreme.primary, fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.high} 
                    stroke={RISK_COLORS.high.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'High', fill: RISK_COLORS.high.primary, fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.moderate} 
                    stroke={RISK_COLORS.moderate.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'Moderate', fill: RISK_COLORS.moderate.primary, fontSize: 10 }}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="none"
                fill="#dc2626"
                fillOpacity={0.1}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature (°F)"
                stroke={getRiskColor()}
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </ComposedChart>
          ) : (
            <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  formatter={(value) => value}
                />
              )}
              {showReferenceLines && (
                <>
                  <ReferenceLine 
                    y={thresholds.extreme} 
                    stroke={RISK_COLORS.extreme.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'Extreme', fill: RISK_COLORS.extreme.primary, fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.high} 
                    stroke={RISK_COLORS.high.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'High', fill: RISK_COLORS.high.primary, fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.moderate} 
                    stroke={RISK_COLORS.moderate.primary} 
                    strokeDasharray="5 5" 
                    label={{ value: 'Moderate', fill: RISK_COLORS.moderate.primary, fontSize: 10 }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature (°F)"
                stroke={getRiskColor()}
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          )}
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
// Daily Trend Line Chart (Specialized)
// ==========================================================================

interface DailyTrendChartProps {
  data: LineChartData[];
  className?: string;
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <TrendLineChart
      data={data}
      title="7-Day Temperature Trend"
      subtitle="Historical temperature data and risk levels"
      height={280}
      showGrid={true}
      showArea={true}
      showLegend={false}
      showReferenceLines={true}
      className={className}
    />
  );
};

// ==========================================================================
// Hourly Trend Line Chart
// ==========================================================================

interface HourlyTrendChartProps {
  data: LineChartData[];
  className?: string;
}

export const HourlyTrendChart: React.FC<HourlyTrendChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <TrendLineChart
      data={data}
      title="Hourly Temperature Trend"
      subtitle="Temperature changes throughout the day"
      height={250}
      showGrid={true}
      showArea={false}
      showLegend={false}
      showReferenceLines={true}
      className={className}
    />
  );
};

// ==========================================================================
// Multi-Line Chart (for comparing zones)
// ==========================================================================

interface MultiLineChartProps {
  data: any[];
  lines: {
    key: string;
    name: string;
    stroke: string;
  }[];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  lines,
  title,
  subtitle,
  height = 300,
  className = '',
}) => {
  return (
    <div className={`bg-background-card border border-border-primary rounded-xl p-6 shadow-lg ${className}`}>
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

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
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
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.stroke}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// All exports are inline above (export default TrendLineChart + export const DailyTrendChart / HourlyTrendChart / MultiLineChart).
// No trailing export block — keeps the file duplicate-free.

export default TrendLineChart;