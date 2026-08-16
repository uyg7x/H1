// ==========================================================================
// HeatGuard AI - Zone Comparison Radar Chart
// Production-grade radar chart for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { RiskLevel, RadarChartData } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// Zone Radar Chart Props
// ==========================================================================

interface ZoneRadarChartProps {
  data: RadarChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

// ==========================================================================
// Custom Tooltip Component
// ==========================================================================

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-background-card border border-border-primary rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-text-primary">{data.subject}</p>
        <p className="text-lg font-bold text-text-primary">
          {data.value}°F
        </p>
        <p className="text-xs text-text-secondary">
          Max: {data.fullMark}°F
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================================================
// Custom Polar Grid with Risk Colors
// ==========================================================================

const CustomPolarGrid: React.FC<any> = (props: any) => {
  const { cx, cy, outerRadius, innerRadius } = props;
  
  return (
    <g>
      {/* Concentric circles */}
      {[0.25, 0.5, 0.75].map((ratio) => {
        const radius = innerRadius + (outerRadius - innerRadius) * ratio;
        return (
          <circle
            key={`grid-circle-${ratio}`}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={1}
            opacity={0.3}
          />
        );
      })}
      {/* Radial lines */}
      {props.angleAxis?.ticks?.map((tick: any, index: number) => {
        const angle = props.angleAxis?.angle || 0;
        const startAngle = props.angleAxis?.startAngle || 0;
        const tickAngle = startAngle + index * angle;
        const x1 = cx + Math.cos(tickAngle * Math.PI / 180) * innerRadius;
        const y1 = cy + Math.sin(tickAngle * Math.PI / 180) * innerRadius;
        const x2 = cx + Math.cos(tickAngle * Math.PI / 180) * outerRadius;
        const y2 = cy + Math.sin(tickAngle * Math.PI / 180) * outerRadius;
        
        return (
          <line
            key={`grid-line-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth={1}
            opacity={0.3}
          />
        );
      })}
    </g>
  );
};

// ==========================================================================
// Custom Radar Shape with Gradient
// ==========================================================================

const CustomRadar: React.FC<any> = (props: any) => {
  const { points, color, fillOpacity } = props;
  
  return (
    <g>
      <defs>
        <linearGradient id={`radar-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity || 0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <polygon
        points={points}
        fill={`url(#radar-gradient-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth={2}
      />
    </g>
  );
};

// ==========================================================================
// Main Zone Radar Chart Component
// ==========================================================================

const ZoneRadarChart: React.FC<ZoneRadarChartProps> = ({
  data,
  title,
  subtitle,
  height = 350,
  showGrid = true,
  showLegend = true,
  className = '',
}) => {
  // Find maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.fullMark ?? 0), 120);
  
  // Create color mapping for each subject
  const colorMap: Record<string, string> = {};
  data.forEach((item, index) => {
    const colors = Object.values(RISK_COLORS);
    colorMap[item.subject] = colors[index % colors.length].primary;
  });

  // Add color to data
  const chartData = data.map(item => ({
    ...item,
    color: colorMap[item.subject] || RISK_COLORS.extreme.primary,
  }));

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
          <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {showGrid && (
              <PolarGrid 
                gridType="polygon" 
                radialLines={false}
                polarRadius={[20, 40, 60, 80]}
                stroke="#374151"
                strokeWidth={1}
                opacity={0.3}
              />
            )}
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}°F`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                wrapperStyle={{ paddingTop: 20 }} 
                formatter={(value) => value}
              />
            )}
            <Radar
              name="Temperature"
              dataKey="value"
              stroke="none"
              fillOpacity={0.6}
              isAnimationActive={true}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={0.6}
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Radar>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend with Colors */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {chartData.map((entry) => (
            <div key={entry.subject} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-text-secondary">{entry.subject}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// Zone Comparison Radar Chart (Specialized)
// ==========================================================================

interface ZoneComparisonChartProps {
  zones: {
    name: string;
    temperature: number;
    riskLevel: RiskLevel;
  }[];
  className?: string;
}

export const ZoneComparisonChart: React.FC<ZoneComparisonChartProps> = ({
  zones,
  className = '',
}) => {
  // Convert zones to radar chart data
  const chartData = zones.map(zone => ({
    subject: zone.name,
    value: zone.temperature,
    fullMark: 120,
    riskLevel: zone.riskLevel,
  }));

  return (
    <ZoneRadarChart
      data={chartData}
      title="Zone Temperature Comparison"
      subtitle="Radar chart showing temperature distribution across zones"
      height={350}
      showGrid={true}
      showLegend={true}
      className={className}
    />
  );
};

// ==========================================================================
// Risk Factor Radar Chart
// ==========================================================================

interface RiskFactorChartProps {
  data: RadarChartData[];
  className?: string;
}

export const RiskFactorChart: React.FC<RiskFactorChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <ZoneRadarChart
      data={data}
      title="Risk Factor Analysis"
      subtitle="Multi-dimensional risk assessment"
      height={320}
      showGrid={true}
      showLegend={true}
      className={className}
    />
  );
};

// ==========================================================================
// Multi-Series Radar Chart
// ==========================================================================

interface MultiRadarChartProps {
  series: {
    name: string;
    data: RadarChartData[];
    color: string;
  }[];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

export const MultiRadarChart: React.FC<MultiRadarChartProps> = ({
  series,
  title,
  subtitle,
  height = 400,
  className = '',
}) => {
  // Find all unique subjects
  const allSubjects = Array.from(new Set(series.flatMap(s => s.data.map(d => d.subject))));
  
  // Create combined data for each series
  const combinedData = allSubjects.map(subject => {
    const seriesData: Record<string, number> = {};
    series.forEach(s => {
      const dataPoint = s.data.find(d => d.subject === subject);
      seriesData[s.name] = dataPoint?.value || 0;
    });
    return { subject, ...seriesData };
  });

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
          <RadarChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <PolarGrid gridType="polygon" radialLines={false} stroke="#374151" opacity={0.3} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            {series.map((s) => (
              <Radar
                key={s.name}
                name={s.name}
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={2}
                fill={s.color}
                fillOpacity={0.2}
                isAnimationActive={true}
                animationDuration={1000}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// All exports are inline above (export default ZoneRadarChart + export const ZoneComparisonChart / RiskFactorChart / MultiRadarChart).
// No trailing export block — keeps the file duplicate-free.

export default ZoneRadarChart;