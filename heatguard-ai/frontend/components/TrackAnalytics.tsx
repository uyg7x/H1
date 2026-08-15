// ==========================================================================
// HeatGuard AI - Track Analytics Dashboard (Tab 4)
// Production-grade analytics for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RISK_COLORS, mockTimeBasedAnalytics, mockRouteAnalytics, mockAIAnalytics, mockRadarChartData } from '../lib/mockData';
import { RiskLevel } from '../lib/types';
import KPICard, { TemperatureKPICard, StatCard } from './ui/KPICard';
import Badge, { RiskBadge, StatusBadge, GradientBadge } from './ui/Badge';
import ProgressBar, { RiskProgressBar, AnimatedProgressBar, CircularProgress, MultiProgressBar } from './ui/ProgressBar';
import TrendLineChart, { MultiLineChart } from './charts/TrendLineChart';
import ZoneRadarChart, { ZoneComparisonChart, RiskFactorChart, MultiRadarChart } from './charts/ZoneRadarChart';

// ==========================================================================
// Track Analytics Component
// ==========================================================================

const TrackAnalytics: React.FC = () => {
  const { 
    temperatureData, 
    zones, 
    routes,
    analytics,
    routeMode
  } = useAppContext();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedTrack, setSelectedTrack] = useState<'both' | 'track01' | 'track06'>('both');

  // Track 01 (Resilient Cities) Analytics
  const track01Analytics = {
    total_routes_analyzed: analytics.route.total_routes_analyzed,
    avg_temp_reduction: analytics.route.avg_temp_reduction,
    population_protected: analytics.route.population_protected,
    emergency_routes_triggered: analytics.route.emergency_routes_triggered,
    safe_routes_completed: analytics.route.safe_routes_completed,
  };

  // Track 06 (AI Agent) Analytics
  const track06Analytics = {
    total_queries: analytics.ai.total_queries,
    autonomous_reroutes: analytics.ai.autonomous_reroutes,
    emergency_alerts: analytics.ai.emergency_alerts,
    avg_response_time_ms: analytics.ai.avg_response_time_ms,
    user_satisfaction: analytics.ai.user_satisfaction,
  };

  // Combined analytics
  const combinedAnalytics = {
    ...track01Analytics,
    ...track06Analytics,
  };

  // Time-based data for charts
  const timeBasedData = [
    { name: '6AM', track01: 45, track06: 32, combined: 77 },
    { name: '9AM', track01: 68, track06: 45, combined: 113 },
    { name: '12PM', track01: 89, track06: 67, combined: 156 },
    { name: '3PM', track01: 72, track06: 53, combined: 125 },
    { name: '6PM', track01: 56, track06: 41, combined: 97 },
    { name: '9PM', track01: 38, track06: 28, combined: 66 },
  ];

  // Zone comparison data for radar chart
  const zoneComparisonData = zones.map(zone => ({
    subject: zone.name,
    value: zone.avg_temperature_f,
    fullMark: 120,
  }));

  // Risk factor data for radar chart
  const riskFactorData = [
    { subject: 'Temperature', value: temperatureData?.temperature_f || 112, fullMark: 120 },
    { subject: 'Humidity', value: temperatureData?.humidity || 15, fullMark: 100 },
    { subject: 'Heat Index', value: temperatureData?.heat_index || 125, fullMark: 150 },
    { subject: 'Risk Level', value: RISK_COLORS[temperatureData?.risk_level || 'extreme'].primary === '#dc2626' ? 100 : 
                RISK_COLORS[temperatureData?.risk_level || 'extreme'].primary === '#ef4444' ? 80 :
                RISK_COLORS[temperatureData?.risk_level || 'extreme'].primary === '#f59e0b' ? 60 : 40, fullMark: 100 },
    { subject: 'Population', value: 156, fullMark: 200 },
  ];

  // Multi-series radar data
  const multiRadarData = [
    {
      name: 'Track 01',
      data: [
        { subject: 'Routes', value: 85 },
        { subject: 'Temperature', value: 92 },
        { subject: 'Safety', value: 78 },
        { subject: 'Population', value: 88 },
      ],
      color: RISK_COLORS.high.primary,
    },
    {
      name: 'Track 06',
      data: [
        { subject: 'Routes', value: 72 },
        { subject: 'Temperature', value: 85 },
        { subject: 'Safety', value: 95 },
        { subject: 'Population', value: 75 },
      ],
      color: '#3b82f6',
    },
  ];

  // Calculate percentages
  const getPercentage = (value: number, max: number = 100) => {
    return (value / max) * 100;
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">📈 Track Analytics & Time Series</h2>
            <p className="text-text-secondary">
              Comprehensive analytics for Track 01 (Resilient Cities) and Track 06 (AI Agent Tools)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value as 'both' | 'track01' | 'track06')}
              className="bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
            >
              <option value="both">Both Tracks</option>
              <option value="track01">Track 01 Only</option>
              <option value="track06">Track 06 Only</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
              className="bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Track Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-1">Track 01: Resilient Cities</h3>
              <p className="text-orange-400 text-sm">Infrastructure & Urban Planning</p>
            </div>
            <GradientBadge fromColor="#f97316" toColor="#dc2626">
              Track 01
            </GradientBadge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-orange-400 mb-1">Routes Analyzed</div>
              <div className="text-2xl font-bold text-white">{track01Analytics.total_routes_analyzed.toLocaleString()}</div>
              <div className="text-xs text-orange-300">+124 today</div>
            </div>
            <div>
              <div className="text-sm text-orange-400 mb-1">Temp Reduction</div>
              <div className="text-2xl font-bold text-white">{track01Analytics.avg_temp_reduction}°F</div>
              <div className="text-xs text-green-300">Avg savings</div>
            </div>
            <div>
              <div className="text-sm text-orange-400 mb-1">Population Protected</div>
              <div className="text-2xl font-bold text-white">{track01Analytics.population_protected.toLocaleString()}</div>
              <div className="text-xs text-orange-300">people</div>
            </div>
            <div>
              <div className="text-sm text-orange-400 mb-1">Safe Routes</div>
              <div className="text-2xl font-bold text-white">{track01Analytics.safe_routes_completed}</div>
              <div className="text-xs text-green-300">{Math.round((track01Analytics.safe_routes_completed / track01Analytics.total_routes_analyzed) * 100)}% success</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-500 mb-1">Track 06: AI Agent Tools</h3>
              <p className="text-blue-400 text-sm">Autonomous Intelligence & Automation</p>
            </div>
            <GradientBadge fromColor="#3b82f6" toColor="#8b5cf6">
              Track 06
            </GradientBadge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-blue-400 mb-1">AI Queries</div>
              <div className="text-2xl font-bold text-white">{track06Analytics.total_queries.toLocaleString()}</div>
              <div className="text-xs text-green-300">+89 today</div>
            </div>
            <div>
              <div className="text-sm text-blue-400 mb-1">Autonomous Reroutes</div>
              <div className="text-2xl font-bold text-white">{track06Analytics.autonomous_reroutes}</div>
              <div className="text-xs text-green-300">AI-driven</div>
            </div>
            <div>
              <div className="text-sm text-blue-400 mb-1">Emergency Alerts</div>
              <div className="text-2xl font-bold text-white">{track06Analytics.emergency_alerts}</div>
              <div className="text-xs text-red-300">Critical warnings</div>
            </div>
            <div>
              <div className="text-sm text-blue-400 mb-1">Response Time</div>
              <div className="text-2xl font-bold text-white">{track06Analytics.avg_response_time_ms}ms</div>
              <div className="text-xs text-green-300">Fast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Metrics */}
      <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-text-primary mb-4">🎯 Combined Track Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <CircularProgress value={getPercentage(combinedAnalytics.total_routes_analyzed, 2000)} size={60} />
            <div className="text-sm text-text-secondary mt-2">Routes Analyzed</div>
            <div className="font-bold text-text-primary">{combinedAnalytics.total_routes_analyzed.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <CircularProgress value={getPercentage(combinedAnalytics.avg_temp_reduction, 25)} size={60} />
            <div className="text-sm text-text-secondary mt-2">Avg Temp Reduction</div>
            <div className="font-bold text-green-500">{combinedAnalytics.avg_temp_reduction}°F</div>
          </div>
          <div className="text-center">
            <CircularProgress value={getPercentage(combinedAnalytics.user_satisfaction)} size={60} />
            <div className="text-sm text-text-secondary mt-2">User Satisfaction</div>
            <div className="font-bold text-purple-500">{combinedAnalytics.user_satisfaction}%</div>
          </div>
          <div className="text-center">
            <CircularProgress value={getPercentage(combinedAnalytics.autonomous_reroutes, 200)} size={60} />
            <div className="text-sm text-text-secondary mt-2">Autonomous Actions</div>
            <div className="font-bold text-blue-500">{combinedAnalytics.autonomous_reroutes}</div>
          </div>
        </div>
      </div>

      {/* Time-Based Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">⏰ Time-Based Analytics</h3>
          <MultiLineChart
            data={timeBasedData}
            lines={[
              { key: 'track01', name: 'Track 01', stroke: RISK_COLORS.high.primary },
              { key: 'track06', name: 'Track 06', stroke: '#3b82f6' },
              { key: 'combined', name: 'Combined', stroke: '#10b981' },
            ]}
            height={250}
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-orange-500">Track 01</div>
              <div className="text-text-secondary">Resilient Cities</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-500">Track 06</div>
              <div className="text-text-secondary">AI Agent</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-500">Combined</div>
              <div className="text-text-secondary">Both Tracks</div>
            </div>
          </div>
        </div>

        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">📊 Risk Factor Analysis</h3>
          <RiskFactorChart data={riskFactorData} />
        </div>
      </div>

      {/* Zone Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneComparisonChart zones={zones} />
        <MultiRadarChart series={multiRadarData} title="Track Comparison" subtitle="Multi-dimensional performance analysis" />
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">🌡️ Temperature Reduction Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Cool Route vs Fast Route</span>
                <span className="text-sm font-bold text-green-500">
                  {Math.round(routes.cool.avg_temperature - routes.fast.avg_temperature)}°F cooler
                </span>
              </div>
              <AnimatedProgressBar
                value={getPercentage(routes.cool.avg_temperature, routes.fast.avg_temperature)}
                color="#10b981"
                showPercentage
                showLabel={false}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Safety Improvement</span>
                <span className="text-sm font-bold text-green-500">
                  {Math.round(((routes.fast.avg_temperature - routes.cool.avg_temperature) / routes.fast.avg_temperature) * 100)}%
                </span>
              </div>
              <AnimatedProgressBar
                value={Math.round(((routes.fast.avg_temperature - routes.cool.avg_temperature) / routes.fast.avg_temperature) * 100)}
                color="#10b981"
                showPercentage
                showLabel={false}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Population Protected</span>
                <span className="text-sm font-bold text-blue-500">
                  {track01Analytics.population_protected.toLocaleString()}
                </span>
              </div>
              <AnimatedProgressBar
                value={getPercentage(track01Analytics.population_protected, 200000)}
                color="#3b82f6"
                showPercentage
                showLabel={false}
              />
            </div>
          </div>
        </div>

        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">🎯 Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Route Success Rate</span>
                <span className="text-sm font-bold text-green-500">
                  {Math.round((track01Analytics.safe_routes_completed / track01Analytics.total_routes_analyzed) * 100)}%
                </span>
              </div>
              <RiskProgressBar
                riskLevel="low"
                value={Math.round((track01Analytics.safe_routes_completed / track01Analytics.total_routes_analyzed) * 100)}
                label=""
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">AI Query Success</span>
                <span className="text-sm font-bold text-blue-500">99.9%</span>
              </div>
              <RiskProgressBar
                riskLevel="low"
                value={99.9}
                label=""
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Emergency Response</span>
                <span className="text-sm font-bold text-orange-500">
                  {Math.round((track06Analytics.emergency_alerts / track06Analytics.total_queries) * 100)}%
                </span>
              </div>
              <RiskProgressBar
                riskLevel="high"
                value={Math.round((track06Analytics.emergency_alerts / track06Analytics.total_queries) * 100)}
                label=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Analysis */}
      <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-text-primary mb-4">🕐 Time Period Heat Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockTimeBasedAnalytics.map((period, index) => {
            const colors = RISK_COLORS[period.avg_risk as RiskLevel];
            return (
              <div key={index} className="bg-background-secondary rounded-lg p-4 border border-border-primary">
                <div className="text-sm text-text-secondary mb-1">{period.time_period}</div>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {period.peak_temperature}°F
                </div>
                <RiskBadge riskLevel={period.avg_risk as RiskLevel} showLabel={false} className="mt-2" />
                <div className="text-xs text-text-tertiary mt-1">
                  {period.active_zones} zones active
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-green-500 mb-4">🏆 Success Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-400">Safe Routes Completed</span>
              <span className="font-bold text-white">{track01Analytics.safe_routes_completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-400">AI Queries Processed</span>
              <span className="font-bold text-white">{track06Analytics.total_queries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-400">User Satisfaction</span>
              <span className="font-bold text-white">{track06Analytics.user_satisfaction}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-orange-500 mb-4">⚠️ Risk Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-400">Emergency Alerts</span>
              <span className="font-bold text-white">{track06Analytics.emergency_alerts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-400">Extreme Heat Zones</span>
              <span className="font-bold text-white">{zones.filter(z => z.risk_level === 'extreme').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-400">High Risk Zones</span>
              <span className="font-bold text-white">{zones.filter(z => z.risk_level === 'high').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-blue-500 mb-4">📊 Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-400">Avg Response Time</span>
              <span className="font-bold text-white">{track06Analytics.avg_response_time_ms}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-400">Temp Reduction</span>
              <span className="font-bold text-white">{track01Analytics.avg_temp_reduction}°F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-400">Population Protected</span>
              <span className="font-bold text-white">
                {Math.round(track01Analytics.population_protected / 1000)}K
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">🔗 Integration Status</h3>
          <div className="flex items-center space-x-2">
            <StatusBadge status="online" />
            <span className="text-sm text-green-500">All systems operational</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-sm font-medium text-text-primary">Track 01</div>
            <div className="text-xs text-green-500">Resilient Cities</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-sm font-medium text-text-primary">Track 06</div>
            <div className="text-xs text-blue-500">AI Agent Tools</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-sm font-medium text-text-primary">API</div>
            <div className="text-xs text-purple-500">FortyGuard</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-sm font-medium text-text-primary">Real-time</div>
            <div className="text-xs text-orange-500">Data Streaming</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border-primary text-center">
          <p className="text-sm text-text-secondary">
            Ready for August 18, 2026 - FortyGuard API Integration
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Replace mock data with real FortyGuard Temperature API on August 18
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// Export
// ==========================================================================

export default TrackAnalytics;