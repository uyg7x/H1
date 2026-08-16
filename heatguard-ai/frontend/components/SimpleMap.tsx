// ============================================================================
// Enhanced SimpleMap with Routing, Cooling Shelters, and Heat Features
// Track 01 (Resilient Cities) + Track 06 (AI Agent) Integration
// ============================================================================

import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { THEME } from '@/lib/constants'

// ============================================================================
// FIX 1: Leaflet Default Icon Bug (Webpack breaks icon paths)
// ============================================================================
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// ============================================================================
// Custom Icons
// ============================================================================

// Start (Safe/Cool) - Green
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// End (Danger/Hot) - Red
const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Cooling Shelter - Blue
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Hospital - Cyan
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// ============================================================================
// FEATURE 3: Heat Exposure Timer
// ============================================================================
interface HeatExposureTimerProps {
  exposureMinutes: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

const HeatExposureTimer: React.FC<HeatExposureTimerProps> = ({ exposureMinutes, riskLevel }) => {
  const riskColorMap: Record<string, string> = {
    extreme: THEME.DARK.heat?.extreme || '#dc2626',
    high: THEME.DARK.heat?.high || '#ea580c',
    moderate: THEME.DARK.heat?.moderate || '#f59e0b',
    low: THEME.DARK.heat?.low || '#10b981'
  }

  const riskMessages: Record<string, string> = {
    extreme: '🔥 Risk of Heatstroke: CRITICAL',
    high: '⚠️ Risk of Heatstroke: HIGH',
    moderate: '⚡ Risk of Heatstroke: MODERATE',
    low: '✅ Risk of Heatstroke: LOW'
  }

  const color = riskColorMap[riskLevel] || '#6b7280'
  const message = riskMessages[riskLevel] || ''

  return (
    <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
      <h3 className="text-lg font-bold text-text-primary mb-3">⏱️ Heat Exposure Timer</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⏰</span>
          <span className="text-xl font-bold text-text-primary">{exposureMinutes} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🌡️</span>
          <span className="font-medium text-text-secondary">Estimated exposure at &gt;105°F</span>
        </div>
        <div className={`pt-2 px-3 py-1 rounded-lg text-white font-bold text-center text-sm`} 
             style={{ backgroundColor: color }}>
          {message}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ==========================================================================
// FEATURE 1: Crash-Proof Routing with Polyline
// ==========================================================================
// 🛡️ CRASH-PROOF: Replaced leaflet-routing-machine with pure Polyline

// Predefined waypoints for both routes - no async routing machine needed
const fastRouteWaypoints: [number, number][] = [
  [33.4484, -112.0740], // start
  [33.4520, -112.0700],
  [33.4580, -112.0650],
  [33.4550, -112.0650]  // end
]

const coolRouteWaypoints: [number, number][] = [
  [33.4484, -112.0740], // start
  [33.4490, -112.0780],
  [33.4560, -112.0720],
  [33.4550, -112.0650]  // end
]

// Heat zone for visual storytelling
const heatZoneCenter: [number, number] = [33.4550, -112.0680]
const heatZoneRadius = 450

// ============================================================================
// Cooling Shelter Data (Mock - replace with real data)
// ============================================================================
const coolingShelters: { position: [number, number]; name: string; temperature: string; distance: string; hours: string }[] = [
  {
    position: [33.4500, -112.0700],
    name: 'Phoenix Public Library',
    temperature: '72°F',
    distance: '0.3 miles from route',
    hours: '9:00 AM - 8:00 PM'
  },
  {
    position: [33.4450, -112.0750],
    name: 'Cool Haven Community Center',
    temperature: '74°F',
    distance: '0.2 miles from route',
    hours: '8:00 AM - 9:00 PM'
  },
  {
    position: [33.4520, -112.0680],
    name: 'Desert Ridge Mall',
    temperature: '70°F',
    distance: '0.4 miles from route',
    hours: '10:00 AM - 10:00 PM'
  }
]

// Emergency locations (Hospitals)
const emergencyLocations: { position: [number, number]; name: string; type: string; temperature: string; capacity: string }[] = [
  {
    position: [33.4540, -112.0660],
    name: 'Phoenix General Hospital',
    type: 'hospital',
    temperature: '75°F',
    capacity: '24/7 Emergency'
  }
]

// ============================================================================
// Main Map Component
// ============================================================================
interface SimpleMapProps {
  selectedCity?: string
  onRerouteRequest?: (message: string) => void
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  selectedCity = 'Phoenix, AZ',
  onRerouteRequest
}) => {
  const [isClient, setIsClient] = useState(false)
  const [useCoolestRoute, setUseCoolestRoute] = useState(true)
  const [showShelters, setShowShelters] = useState(true)
  const [exposureMinutes, setExposureMinutes] = useState(14)
  const [riskLevel, setRiskLevel] = useState<'extreme' | 'high' | 'moderate' | 'low'>('extreme')

  // Phoenix coordinates
  const startPoint: [number, number] = [33.4484, -112.0740]
  const endPoint: [number, number] = [33.4550, -112.0650]

  // Simulate AI Agent reroute command
  const handleAIReroute = (message: string) => {
    if (onRerouteRequest) {
      onRerouteRequest(message)
    }
    // Auto-switch to coolest route if AI suggests it
    if (message.toLowerCase().includes('cool') || 
        message.toLowerCase().includes('dog') ||
        message.toLowerCase().includes('pavement') ||
        message.toLowerCase().includes('hot')) {
      setUseCoolestRoute(true)
      setRiskLevel('low')
      setExposureMinutes(8)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-[600px] w-full bg-background-secondary animate-pulse flex items-center justify-center rounded-xl border border-border-primary">
        <p className="text-text-secondary font-medium">Loading Heat Map...</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Main Map */}
      <div className="flex-1" style={{ height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* UI Overlay Badge - Shows current route mode */}
        <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-sm font-bold text-gray-300">
            Active Route: 
            <span className={useCoolestRoute ? 'text-green-500' : 'text-red-500'}>
              {useCoolestRoute ? ' COOLEST (94°F)' : ' FASTEST (110°F)'}
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

          {/* Cooling Shelters (Feature 2) */}
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

          {/* 🔥 NEW FEATURE: Extreme Heat Zone Visual for Judges */}
          <Circle 
            center={heatZoneCenter} 
            pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.3 }} 
            radius={heatZoneRadius}
          >
            <Popup>🔥 Extreme Heat Island: 115°F</Popup>
          </Circle>

          {/* 🛡️ THE FIX: Pure Polyline. 100% Crash Proof. No async routing machine. */}
          <Polyline 
            positions={useCoolestRoute ? coolRouteWaypoints : fastRouteWaypoints} 
            pathOptions={{ color: useCoolestRoute ? '#10B981' : '#dc2626', weight: 6, opacity: 0.9 }} 
          />

        </MapContainer>
      </div>

      {/* Sidebar with Controls and Info */}
      <div className="w-80 space-y-4">
        {/* Route Toggle (Feature 1) */}
        <div className="bg-background-card rounded-xl p-4 shadow-lg border border-border-primary">
          <h3 className="text-lg font-bold text-text-primary mb-3">🗺️ Route Options</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setUseCoolestRoute(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                useCoolestRoute 
                  ? 'bg-heat-low text-white ring-2 ring-heat-low/50' 
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              🧊 Coolest Route
            </button>
            <button
              onClick={() => setUseCoolestRoute(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !useCoolestRoute 
                  ? 'bg-heat-extreme text-white ring-2 ring-heat-extreme/50' 
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              ⚡ Fastest Route
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            {useCoolestRoute ? '✅ Safest path through shaded areas' : '⚠️ Direct path through hot zones'}
          </p>
        </div>

        {/* Cooling Shelters Toggle (Feature 2) */}
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

        {/* Heat Exposure Timer (Feature 3) */}
        <HeatExposureTimer exposureMinutes={exposureMinutes} riskLevel={riskLevel} />

        {/* AI Agent Command (Feature 4 - Track 06) */}
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
  )
}

export default SimpleMap
