import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import { MapPin, Navigation, Thermometer, Clock, Route, Play, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react'
import L from 'leaflet'
import apiService from '../services/mockApi'

const COLORS = {
  extreme: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e'
}

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  })
}

function RoutePlanner({ selectedCity, showToast }) {
  const [routePoints, setRoutePoints] = useState([])
  const [selectedPoints, setSelectedPoints] = useState([])
  const [routeResult, setRouteResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState([33.4484, -112.0740])

  useEffect(() => {
    const points = apiService.getRoutePoints()
    setRoutePoints(points)
    if (selectedCity.lat && selectedCity.lng) {
      setMapCenter([selectedCity.lat, selectedCity.lng])
    }
  }, [selectedCity])

  const togglePoint = (point) => {
    if (selectedPoints.find(p => p.id === point.id)) {
      setSelectedPoints(selectedPoints.filter(p => p.id !== point.id))
    } else if (selectedPoints.length < 5) {
      setSelectedPoints([...selectedPoints, point])
    } else {
      showToast('Maximum 5 waypoints allowed', 'error')
    }
  }

  const analyzeRoute = async () => {
    if (selectedPoints.length < 2) {
      showToast('Select at least 2 waypoints', 'error')
      return
    }
    setLoading(true)
    try {
      const waypoints = selectedPoints.map(p => p.name)
      const result = await apiService.analyzeRoute(waypoints)
      setRouteResult(result.data)
      showToast('Route analysis complete!', 'success')
    } catch (err) {
      showToast('Route analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const clearRoute = () => {
    setSelectedPoints([])
    setRouteResult(null)
  }

  const getRiskColor = (risk) => COLORS[risk] || COLORS.moderate

  const polylinePositions = selectedPoints.map(p => [p.lat, p.lng])

  return (
    <div className='fade-in'>
      <div className='page-header'>
        <h1>Cool Route Planner</h1>
        <p>AI-powered heat-aware routing for {selectedCity.name} — minimize exposure, maximize safety</p>
      </div>

      <div className='route-planner'>
        {/* Left Panel */}
        <div className='route-panel'>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Select Waypoints</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click points on the map or select from list (max 5)</p>
          </div>

          <div className='route-waypoints'>
            {selectedPoints.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                <MapPin size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No waypoints selected</div>
              </div>
            )}
            {selectedPoints.map((point, i) => (
              <div key={point.id} className='route-waypoint'>
                <div className={`route-waypoint-dot ${i === 0 ? 'start' : i === selectedPoints.length - 1 ? 'end' : 'waypoint'}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{point.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{point.temp}°F • {point.risk}</div>
                </div>
                <button onClick={() => togglePoint(point)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>
              Available Points
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {routePoints.filter(p => !selectedPoints.find(sp => sp.id === p.id)).map(point => (
                <button
                  key={point.id}
                  onClick={() => togglePoint(point)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: getRiskColor(point.risk) }} />
                  <span style={{ flex: 1 }}>{point.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{point.temp}°F</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className='route-btn' onClick={analyzeRoute} disabled={loading || selectedPoints.length < 2}>
              {loading ? (
                <><div className='loading-spinner' style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</>
              ) : (
                <><Play size={16} /> Analyze Route</>
              )}
            </button>
            <button 
              onClick={clearRoute}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {routeResult && (
            <div className='route-result'>
              <div className='route-result-title'>Route Analysis Result</div>
              <div className='route-metric'>
                <span className='route-metric-label'>Total Distance</span>
                <span className='route-metric-value'>{routeResult.total_distance_mi} mi</span>
              </div>
              <div className='route-metric'>
                <span className='route-metric-label'>Est. Time</span>
                <span className='route-metric-value'>{routeResult.estimated_time_min} min</span>
              </div>
              <div className='route-metric'>
                <span className='route-metric-label'>Avg Temperature</span>
                <span className='route-metric-value' style={{ color: COLORS[routeResult.avg_temp_f > 105 ? 'extreme' : routeResult.avg_temp_f > 95 ? 'high' : 'moderate'] }}>
                  {routeResult.avg_temp_f}°F
                </span>
              </div>
              <div className='route-metric'>
                <span className='route-metric-label'>Max Temperature</span>
                <span className='route-metric-value' style={{ color: COLORS.extreme }}>
                  {routeResult.max_temp_f}°F
                </span>
              </div>
              <div className='route-metric'>
                <span className='route-metric-label'>Heat Exposure Score</span>
                <span className='route-metric-value'>{routeResult.heat_exposure_score}/100</span>
              </div>

              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color={COLORS.moderate} /> Recommendations
                </div>
                {routeResult.recommendations.map((rec, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <CheckCircle size={12} color={COLORS.low} style={{ marginTop: 2, flexShrink: 0 }} />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className='route-map-container'>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routePoints.map(point => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={createCustomIcon(getRiskColor(point.risk))}
                eventHandlers={{ click: () => togglePoint(point) }}
              >
                <Popup>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{point.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{point.temp}°F • {point.risk}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Click to {selectedPoints.find(p => p.id === point.id) ? 'remove' : 'add'}</div>
                </Popup>
              </Marker>
            ))}
            {polylinePositions.length > 1 && (
              <Polyline 
                positions={polylinePositions} 
                color={routeResult ? COLORS[routeResult.avg_temp_f > 105 ? 'extreme' : 'high'] : '#f97316'} 
                weight={4}
                opacity={0.8}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export default RoutePlanner