// ==========================================================================
// HeatGuard AI - Risk Distribution Pie Chart
// Production-grade pie chart for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { RiskLevel, PieChartData } from '../../lib/types';
import { RISK_COLORS } from '../../lib/mockData';

// ==========================================================================
// Risk Pie Chart Props
// ==========================================================================

interface RiskPieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  className?: string;
}

// ==========================================================================
// Custom Tooltip Component
// ==========================================================================

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / payload.reduce((sum: number, p: any) => sum + p.payload.value, 0)) * 100).toFixed(1);

    return (
      <div className="bg-background-card border border-border-primary rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-text-primary">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.color }}>
          {data.value} zones ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================================================
// Custom Label Component
// ==========================================================================

const CustomLabel: React.FC<any> = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index, name, color }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show labels for larger segments
  if (value < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {name} ({value}%)
    </text>
  );
};

// ==========================================================================
// Risk Level Data Preparation
// ==========================================================================

const prepareRiskData = (data: { name: string; value: number }[]): PieChartData[] => {
  return data.map(item => ({
    ...item,
    color: RISK_COLORS[item.name as RiskLevel]?.primary || RISK_COLORS.low.primary,
  }));
};

// ==========================================================================
// Main Risk Pie Chart Component
// ==========================================================================

const RiskPieChart: React.FC<RiskPieChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showLabels = false,
  className = '',
}) => {
  // Prepare data with colors
  const chartData = prepareRiskData(data);
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => value}
              />
            )}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? CustomLabel : undefined}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              isAnimationActive={true}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#1f2937"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            {/* Center Label */}
            <text
              x="50%"
              y="50%"
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="18"
              fontWeight="bold"
            >
              {total}%
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-text-secondary">
                {entry.name}: {entry.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// Risk Distribution Pie Chart (Specialized)
// ==========================================================================

interface RiskDistributionChartProps {
  riskData: Record<RiskLevel, number>;
  className?: string;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  riskData,
  className = '',
}) => {
  // Convert risk data to pie chart format
  const chartData = Object.entries(riskData).map(([name, value]) => ({
    name,
    value,
    color: RISK_COLORS[name as RiskLevel].primary,
  }));

  return (
    <RiskPieChart
      data={chartData}
      title="Risk Level Distribution"
      subtitle="Percentage of zones at each risk level"
      height={280}
      showLegend={true}
      className={className}
    />
  );
};

// ==========================================================================
// Zone Risk Pie Chart
// ==========================================================================

interface ZoneRiskChartProps {
  data: PieChartData[];
  className?: string;
}

export const ZoneRiskChart: React.FC<ZoneRiskChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <RiskPieChart
      data={data}
      title="Zone Risk Distribution"
      subtitle="Temperature risk levels across different zones"
      height={300}
      showLegend={true}
      className={className}
    />
  );
};

// ==========================================================================
// Donut Chart Component
// ==========================================================================

interface DonutChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  height = 250,
  innerRadius = 60,
  outerRadius = 80,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

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
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              isAnimationActive={true}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#1f2937"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="20"
              fontWeight="bold"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-text-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// All exports are inline above (export default RiskPieChart + export const RiskDistributionChart / ZoneRiskChart / DonutChart).
// No trailing export block — keeps the file duplicate-free.