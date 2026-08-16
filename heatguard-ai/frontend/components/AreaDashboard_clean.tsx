// ============================================================================
// HeatGuard AI - Area Intelligence Dashboard (Tab 2) - CLEAN VERSION
// Uses only standard Tailwind classes, no custom CSS variables
// ============================================================================

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RISK_COLORS, mockHeatZones, mockHourlyForecast, mockBarChartData, mockLineChartData } from '../lib/mockData';
import { RiskLevel } from '../lib/types';
import KPICard from './ui/KPICard';
import Badge, { RiskBadge, TemperatureBadge } from './ui/Badge';
import ProgressBar, { RiskProgressBar } from './ui/ProgressBar';

const AreaDashboardClean: React.FC = () => {
  const { 
    temperatureData = mockTemperatureData, 
    zones: heatZones = mockHeatZones, 
    selectedZone, 
    setSelectedZone,
  } = useAppContext();

  const [selectedCity, setSelectedCity] = useState('Phoenix, AZ');

  // Calculate zone statistics
  const getZoneStats = () => {
    const totalPopulation = heatZones.reduce((sum, zone) => sum + zone.population, 0);
    const avgTemperature = heatZones.reduce((sum, zone) => sum + zone.avg_temperature_f, 0) / heatZones.length;
    const extremeZones = heatZones.filter(zone => zone.risk_level === 'extreme').length;
    const highZones = heatZones.filter(zone => zone.risk_level === 'high').length;
    
    return {
      totalPopulation,
      avgTemperature,
      extremeZones,
      highZones,
      moderateZones: heatZones.filter(zone => zone.risk_level === 'moderate').length,
      lowZones: heatZones.filter(zone => zone.risk_level === 'low').length,
    };
  };

  const zoneStats = getZoneStats();

  // Handle zone selection
  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">📊 Area Intelligence Dashboard</h2>
            <p className="text-gray-400">
              Real-time heat analysis and zone intelligence for {selectedCity}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="Phoenix, AZ">Phoenix, AZ</option>
              <option value="Los Angeles, CA">Los Angeles, CA</option>
              <option value="Dallas, TX">Dallas, TX</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Current Temperature"
          value={`${temperatureData?.temperature_f || 112.5}°F`}
          subtitle={temperatureData?.risk_level?.toUpperCase() || 'EXTREME'}
          icon="🌡️"
          color="red"
        />
        <KPICard
          title="Total Population"
          value={zoneStats.totalPopulation.toLocaleString()}
          subtitle="Across all zones"
          icon="👥"
          color="blue"
        />
        <KPICard
          title="Average Temperature"
          value={`${zoneStats.avgTemperature.toFixed(1)}°F`}
          subtitle="Across all zones"
          icon="📊"
          color="orange"
        />
        <KPICard
          title="Extreme Risk Zones"
          value={zoneStats.extremeZones}
          subtitle="Zones > 110°F"
          icon="🔥"
          color="red"
        />
      </div>

      {/* Zone Selector */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Select Zone</h3>
        <div className="flex flex-wrap gap-3">
          {heatZones.map((zone) => {
            const colors = RISK_COLORS[zone.risk_level as RiskLevel];
            const isSelected = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(zone.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700/50'
                }`}
                style={{
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary
                }}
              >
                <div className="font-medium text-white">{zone.name}</div>
                <div className="text-xs text-gray-300">{zone.avg_temperature_f}°F</div>
                <div className="text-xs text-gray-400">Pop: {zone.population.toLocaleString()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone Details Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Zone Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Zone</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Temperature</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Risk Level</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Population</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Area (km²)</th>
              </tr>
            </thead>
            <tbody>
              {heatZones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 text-white">{zone.name}</td>
                  <td className="py-3">
                    <TemperatureBadge temperature={zone.avg_temperature_f} riskLevel={zone.risk_level} />
                  </td>
                  <td className="py-3">
                    <RiskBadge riskLevel={zone.risk_level} />
                  </td>
                  <td className="py-3 text-gray-300">{zone.population.toLocaleString()}</td>
                  <td className="py-3 text-gray-300">{zone.area_km2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Risk Distribution</h3>
        <div className="space-y-4">
          <RiskProgressBar
            riskLevel="extreme"
            value={(zoneStats.extremeZones / heatZones.length) * 100}
            label="Extreme Risk Zones"
          />
          <RiskProgressBar
            riskLevel="high"
            value={(zoneStats.highZones / heatZones.length) * 100}
            label="High Risk Zones"
          />
          <RiskProgressBar
            riskLevel="moderate"
            value={(zoneStats.moderateZones / heatZones.length) * 100}
            label="Moderate Risk Zones"
          />
          <RiskProgressBar
            riskLevel="low"
            value={(zoneStats.lowZones / heatZones.length) * 100}
            label="Low Risk Zones"
          />
        </div>
      </div>

      {/* Temperature Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">🌡️ Temperature Range</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Lowest</span>
              <span className="text-lg font-bold text-green-500">
                {Math.min(...heatZones.map(z => z.avg_temperature_f))}°F
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Average</span>
              <span className="text-lg font-bold text-orange-500">
                {zoneStats.avgTemperature.toFixed(1)}°F
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Highest</span>
              <span className="text-lg font-bold text-red-500">
                {Math.max(...heatZones.map(z => z.avg_temperature_f))}°F
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">👥 Population Impact</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Population</span>
              <span className="text-lg font-bold text-white">
                {zoneStats.totalPopulation.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">At Risk (&gt;95°F)</span>
              <span className="text-lg font-bold text-red-500">
                {(zoneStats.extremeZones + zoneStats.highZones) * 25000}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Safe (&lt;95°F)</span>
              <span className="text-lg font-bold text-green-500">
                {(zoneStats.moderateZones + zoneStats.lowZones) * 25000}K
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">🔗 API Status</h3>
          <p className="text-sm text-gray-400 mb-4">FortyGuard Temperature API Connection</p>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-500">Connected</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Resolution</div>
              <div className="font-bold text-white">10mi²</div>
            </div>
            <div>
              <div className="text-gray-400">Measurement</div>
              <div className="font-bold text-white">2m above ground</div>
            </div>
            <div>
              <div className="text-gray-400">Credits Remaining</div>
              <div className="font-bold text-green-500">{temperatureData?.credits_remaining?.toLocaleString() || '999,999'}</div>
            </div>
            <div>
              <div className="text-gray-400">Last Updated</div>
              <div className="font-bold text-white">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import mockTemperatureData for fallback
import { mockTemperatureData } from '../lib/mockData';

export default AreaDashboardClean;
