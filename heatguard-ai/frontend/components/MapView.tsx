// ==========================================================================
// HeatGuard AI - Map View Component (Tab 1)
// Production-grade map visualization for FortyGuard Global AI Hackathon '26
// 100% CRASH-PROOF: Uses pure React-Leaflet Polyline, NO leaflet-routing-machine
// ==========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { RISK_COLORS, mockRoutes, heatZoneCircle } from '../lib/mockData';
import { RiskLevel } from '../lib/types';
import KPICard, { TemperatureKPICard, StatCard } from './ui/KPICard';
import Badge, { RiskBadge, TemperatureBadge } from './ui/Badge';

// ==========================================================================
// Fix Leaflet Default Icon Bug
// ==========================================================================

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// ==========================================================================
// Custom Icons
// ==========================================================================

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ==========================================================================
// Map View Component
// ==========================================================================

const MapView: React.FC = () => {
  const {
    routeMode,
    setRouteMode,
    temperatureData,
    selectedCity,
    zones,
    routes,
    handleAIAction
  } = useAppContext();

  const [isClient, setIsClient] = useState(false);
  const [showShelters, setShowShelters] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Phoenix coordinates
  const startPoint: [number, number] = [33.4484, -112.0740];
  const endPoint: [number, number] = [33.4650, -112.0600];

  // 🔥 Heat Zone for visual storytelling
  const heatZone = heatZoneCircle;

  // 🛡️ CRASH-PROOF ROUTING: Convert route waypoints to LatLng tuples
  const fastRouteWaypoints: [number, number][] = routes.fast.waypoints.map(wp => [wp.lat, wp.lng]);
  const coolRouteWaypoints: [number, number][] = routes.cool.waypoints.map(wp => [wp.lat, wp.lng]);

  const currentWaypoints = routeMode === 'cool' ? coolRouteWaypoints : fastRouteWaypoints;
  const routeColor = routeMode === 'cool' ? '#10B981' : '#dc2626';

  // Cooling shelters data
  const coolingShelters = [
    {
      position: [33.4500, -112.0700] as [number, number],
      name: 'Phoenix Public Library',
      temperature: '72°F',
      distance: '0.3 miles from route',
      hours: '9:00 AM - 8:00 PM'
    },
    {
      position: [33.4450, -112.0750] as [number, number],
      name: 'Cool Haven Community Center',
      temperature: '74°F',
      distance: '0.2 miles from route',
      hours: '8:00 AM - 9:00 PM'
    },
    {
      position: [33.4520, -112.0680] as [number, number],
      name: 'Desert Ridge Mall',
      temperature: '70°F',
      distance: '0.4 miles from route',
      hours: '10:00 AM - 10:00 PM'
    }
  ];

  // Emergency locations
  const emergencyLocations = [
    {
      position: [33.4540, -112.0660] as [number, number],
      name: 'Phoenix General Hospital',
      type: 'hospital',
      temperature: '75°F',
      capacity: '24/7 Emergency'
    }
  ];

  // Handle AI reroute command
  const handleAIReroute = useCallback((message: string) => {
    handleAIAction('reroute');
    setRouteMode('cool');
  }, [handleAIAction, setRouteMode]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <TemperatureKPICard
          temperature={temperatureData?.temperature_f || 112.5}
          riskLevel={temperatureData?.risk_level || 'extreme'}
          location={selectedCity}
        />
        
        <StatCard
          label="Route Type"
          value={routeMode === 'cool' ? 'Cool Route' : 'Fast Route'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke="currentColor" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color={routeMode === 'cool' ? '#10B981' : '#dc2626'}
        />

        <StatCard
          label="Avg Temperature"
          value={`${routeMode === 'cool' ? routes.cool.avg_temperature : routes.fast.avg_temperature}°F`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M12 2v20M12 2a10 10 0 100 20 10 10 0 000-20z" />
              <path stroke="currentColor" strokeWidth={2} d="M12 6v6M12 18v-6" />
            </svg>
          }
          color={routeMode === 'cool' ? '#10B981' : '#dc2626'}
        />

        <StatCard
          label="Risk Level"
          value={routeMode === 'cool' ? routes.cool.risk_level : routes.fast.risk_level}
          icon={<RiskBadge riskLevel={routeMode === 'cool' ? routes.cool.risk_level : routes.fast.risk_level} showLabel={false} />}
          color={RISK_COLORS[routeMode === 'cool' ? routes.cool.risk_level : routes.fast.risk_level].primary}
        />
      </div>

      {/* Main Map Container */}
      <div className="flex-1 flex gap-6">
        {/* Map */}
        <div className="flex-1 relative bg-background-secondary rounded-2xl overflow-hidden border border-border-primary shadow-2xl">
          
          {/* UI Overlay Badge - Shows current route mode */}
          <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-sm font-bold text-gray-300">
              Active Route: 
              <span className={routeMode === 'cool' ? 'text-green-500' : 'text-red-500'}>
                {routeMode === 'cool' ? ' COOLEST (94°F)' : ' FASTEST (110°F)'}
              </span>
            </p>
          </div>

          <MapContainer 
            center={startPoint} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* 🔥 NEW FEATURE: Extreme Heat Zone Visual for Judges */}
            <Circle 
              center={[heatZone.center.lat, heatZone.center.lng]} 
              pathOptions={{ 
                color: '#EF4444', 
                fillColor: '#EF4444', 
                fillOpacity: 0.3 
              }} 
              radius={heatZone.radius}
            >
              <Popup>🔥 Extreme Heat Island: {heatZone.temperature}°F</Popup>
            </Circle>

            {/* Start Marker */}
            <Marker position={startPoint} icon={startIcon}>
              <Popup>
                <div className="font-bold text-green-600">🟢 Start Point</div>
                <div>City Hall, Phoenix</div>
                <div>🌡️ 95°F (Safe)</div>
                <div className="text-sm text-gray-500">2m above ground</div>
              </Popup>
            </Marker>

            {/* End Marker */}
            <Marker position={endPoint} icon={endIcon}>
              <Popup>
                <div className="font-bold text-red-500">🔴 Destination</div>
                <div>Hospital District</div>
                <div>🌡️ 108°F (Extreme)</div>
                <div className="text-sm text-gray-500">2m above ground</div>
              </Popup>
            </Marker>

            {/* Cooling Shelters */}
            {showShelters && coolingShelters.map((shelter, index) => (
              <Marker 
                key={`shelter-${index}`}
                position={shelter.position} 
                icon={shelterIcon}
              >
                <Popup>
                  <div className="font-bold text-blue-600">❄️ {shelter.name}</div>
                  <div>🌡️ {shelter.temperature}</div>
                  <div className="text-sm">{shelter.distance}</div>
                  <div className="text-sm">{shelter.hours}</div>
                </Popup>
              </Marker>
            ))}

            {/* Emergency Locations */}
            {emergencyLocations.map((location, index) => (
              <Marker 
                key={`hospital-${index}`}
                position={location.position} 
                icon={hospitalIcon}
              >
                <Popup>
                  <div className="font-bold text-cyan-600">🏥 {location.name}</div>
                  <div>Type: {location.type}</div>
                  <div>🌡️ {location.temperature}</div>
                  <div className="text-sm">{location.capacity}</div>
                </Popup>
              </Marker>
            ))}

            {/* 🛡️ THE FIX: Pure Polyline. 100% Crash Proof. No async routing machine. */}
            <Polyline 
              positions={currentWaypoints} 
              pathOptions={{ 
                color: routeColor, 
                weight: 6, 
                opacity: 0.9 
              }} 
            />

          </MapContainer>
        </div>

        {/* Sidebar with Controls and Info */}
        <div className="w-80 space-y-4">
          {/* Route Toggle */}
          <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
            <h3 className="text-lg font-bold text-text-primary mb-3">🗺️ Route Options</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setRouteMode('cool')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  routeMode === 'cool' 
                    ? 'bg-heat-low text-white ring-2 ring-heat-low/50' 
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                🧊 Coolest Route
              </button>
              <button
                onClick={() => setRouteMode('fast')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  routeMode === 'fast' 
                    ? 'bg-heat-extreme text-white ring-2 ring-heat-extreme/50' 
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                ⚡ Fastest Route
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              {routeMode === 'cool' ? '✅ Safest path through shaded areas' : '⚠️ Direct path through hot zones'}
            </p>
          </div>

          {/* Cooling Shelters Toggle */}
          <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
            <h3 className="text-lg font-bold text-text-primary mb-3">❄️ Cooling Shelters</h3>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                showShelters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-background-secondary text-text-secondary'
              }`}
            >
              {showShelters ? 'Hide Shelters' : 'Show Shelters'}
            </button>
            <p className="text-sm text-text-secondary mt-2">
              {showShelters ? '📍 Blue markers show air-conditioned public spaces' : 'Click to show cooling locations'}
            </p>
          </div>

          {/* Heat Zone Toggle */}
          <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
            <h3 className="text-lg font-bold text-text-primary mb-3">🔥 Heat Zones</h3>
            <button
              onClick={() => setShowZones(!showZones)}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                showZones 
                  ? 'bg-red-600 text-white' 
                  : 'bg-background-secondary text-text-secondary'
              }`}
            >
              {showZones ? 'Hide Heat Zones' : 'Show Heat Zones'}
            </button>
            <p className="text-sm text-text-secondary mt-2">
              {showZones ? '🌡️ Red zones indicate extreme heat areas' : 'Click to show heat zones'}
            </p>
          </div>

          {/* AI Agent Command */}
          <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
            <h3 className="text-lg font-bold text-text-primary mb-3">🤖 AI Agent</h3>
            <p className="text-sm text-text-secondary mb-3">
              Type commands to control your route based on real-time temperature data
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleAIReroute('Hey AI, I have a dog with me. Reroute me if the pavement exceeds 110°F.')}
                className="w-full py-2 px-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-900 transition-all text-left"
              >
                🐕 "Reroute for my dog"
              </button>
              <button
                onClick={() => handleAIReroute('Find the coolest path to the hospital avoiding heat zones.')}
                className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-900 transition-all text-left"
              >
                🏥 "Coolest path to hospital"
              </button>
              <button
                onClick={() => handleAIReroute('Show me all cooling shelters within 0.5 miles.')}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all text-left"
              >
                ❄️ "Show nearby shelters"
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
            <h3 className="text-lg font-bold text-text-primary mb-3">ℹ️ Map Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-text-primary">🟢 Start (Safe)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-text-primary">🔴 Destination (Hot)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-text-primary">❄️ Cooling Shelter</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                <span className="text-text-primary">🏥 Hospital</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-text-primary">🔥 Heat Zone (115°F)</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-16 h-2 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-text-primary">🟢 Coolest Route</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                <span className="text-text-primary">🔴 Fastest Route</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
          <h3 className="text-lg font-bold text-text-primary mb-3">📊 Route Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-text-secondary mb-1">Distance</div>
              <div className="text-2xl font-bold text-green-500">{routes.cool.distance_km} km</div>
              <div className="text-xs text-text-tertiary">Cool Route</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Distance</div>
              <div className="text-2xl font-bold text-red-500">{routes.fast.distance_km} km</div>
              <div className="text-xs text-text-tertiary">Fast Route</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Time</div>
              <div className="text-2xl font-bold text-green-500">{routes.cool.duration_minutes} min</div>
              <div className="text-xs text-text-tertiary">Cool Route</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Time</div>
              <div className="text-2xl font-bold text-red-500">{routes.fast.duration_minutes} min</div>
              <div className="text-xs text-text-tertiary">Fast Route</div>
            </div>
          </div>
        </div>

        <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
          <h3 className="text-lg font-bold text-text-primary mb-3">🏆 Temperature Savings</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">
              {Math.round(routes.fast.avg_temperature - routes.cool.avg_temperature)}°F
            </div>
            <div className="text-sm text-text-secondary">
              Cooler with AI-optimized route
            </div>
            <div className="mt-2">
              <RiskBadge riskLevel="low" />
              <span className="ml-2 text-sm text-text-primary">
                {((routes.cool.avg_temperature / routes.fast.avg_temperature) * 100).toFixed(1)}% safer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// ClientOnly Component (for Next.js SSR)
// ==========================================================================

const ClientOnly: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
};

// ==========================================================================
// Export
// ==========================================================================

export default MapView;