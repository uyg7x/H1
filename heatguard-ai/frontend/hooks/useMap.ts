// ============================================================================
// Custom Hook for Map State Management
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { LatLng, MapViewState } from '@/types';
import { MAP_CONFIG } from '@/lib/constants';

export interface UseMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onCenterChange?: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
}

export interface UseMapReturn {
  mapRef: React.MutableRefObject<L.Map | null>;
  center: [number, number];
  zoom: number;
  bounds: L.LatLngBounds | null;
  isReady: boolean;
  setView: (center: [number, number], zoom?: number) => void;
  fitBounds: (bounds: L.LatLngBounds) => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  handleMapMove: () => void;
  handleMapZoom: () => void;
  saveViewState: () => MapViewState;
  restoreViewState: (state: MapViewState) => void;
}

export const useMap = ({
  initialCenter = MAP_CONFIG.DEFAULT_CENTER,
  initialZoom = MAP_CONFIG.DEFAULT_ZOOM,
  onBoundsChange,
  onCenterChange,
  onZoomChange,
}: UseMapProps = {}): UseMapReturn => {
  const mapRef = useRef<L.Map | null>(null);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Handle map movement - imperative only, no React state updates
  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;
    
    const currentCenter = mapRef.current.getCenter();
    const currentBounds = mapRef.current.getBounds();
    
    // Only call external callbacks, don't update internal state
    // This prevents infinite re-render loops
    if (onCenterChange) {
      onCenterChange([currentCenter.lat, currentCenter.lng]);
    }
    
    if (onBoundsChange) {
      onBoundsChange(currentBounds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle zoom changes - imperative only, no React state updates
  const handleMapZoom = useCallback(() => {
    if (!mapRef.current) return;
    
    const currentZoom = mapRef.current.getZoom();
    
    // Only call external callbacks, don't update internal state
    if (onZoomChange) {
      onZoomChange(currentZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set map view
  const setView = useCallback((newCenter: [number, number], newZoom?: number) => {
    if (!mapRef.current) return;
    
    const currentZoom = mapRef.current.getZoom();
    const zoomLevel = newZoom ?? currentZoom;
    mapRef.current.setView(new L.LatLng(newCenter[0], newCenter[1]), zoomLevel);
    // Don't update React state here - it causes re-renders that re-initialize MapContainer
    // The map ref is the source of truth for imperative operations
  }, []);

  // Fit map to bounds
  const fitBounds = useCallback((newBounds: L.LatLngBounds) => {
    if (!mapRef.current) return;
    
    mapRef.current.fitBounds(newBounds);
    // Don't update React state - imperative API only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to location with smooth animation
  const flyTo = useCallback((newCenter: [number, number], newZoom?: number) => {
    if (!mapRef.current) return;
    
    const currentZoom = mapRef.current.getZoom();
    const zoomLevel = newZoom ?? currentZoom;
    mapRef.current.flyTo(new L.LatLng(newCenter[0], newCenter[1]), zoomLevel, {
      duration: 1,
      easeLinearity: 0.25,
    });
    // Don't update React state - imperative API only
  }, []);

  // Save current view state
  const saveViewState = useCallback((): MapViewState => {
    if (!mapRef.current) {
      return {
        center: initialCenter,
        zoom: initialZoom,
      };
    }
    
    const currentCenter = mapRef.current.getCenter();
    return {
      center: [currentCenter.lat, currentCenter.lng],
      zoom: mapRef.current.getZoom(),
    };
  }, [initialCenter, initialZoom]);

  // Restore view state
  const restoreViewState = useCallback((state: MapViewState) => {
    if (!mapRef.current) return;
    
    mapRef.current.setView(
      new L.LatLng(state.center[0], state.center[1]),
      state.zoom
    );
    // Don't update React state - imperative API only
  }, []);

  // Initialize map
  useEffect(() => {
    // Map is initialized via the MapContainer component
    // This effect just marks it as ready
    setIsReady(true);
  }, []);

  return {
    mapRef,
    center,
    zoom,
    bounds,
    isReady,
    setView,
    fitBounds,
    flyTo,
    handleMapMove,
    handleMapZoom,
    saveViewState,
    restoreViewState,
  };
};

// ============================================================================
// Hook for Heat Layer Management
// ============================================================================

import { HeatZone } from '@/types';

export const useHeatLayer = (zones: HeatZone[] = []) => {
  const [heatLayer, setHeatLayer] = useState<L.LayerGroup | null>(null);
  const [zoneLayers, setZoneLayers] = useState<Map<string, L.Polygon>>(new Map());
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Create or update heat layer
  const updateHeatLayer = useCallback((newZones: HeatZone[] = []) => {
    if (!layerRef.current) {
      layerRef.current = L.layerGroup();
      setHeatLayer(layerRef.current);
    } else {
      layerRef.current.clearLayers();
    }

    const newZoneLayers = new Map<string, L.Polygon>();

    newZones.forEach((zone) => {
      const color = getZoneColor(zone.risk_level);
      
      const polygon = L.polygon(zone.polygon as L.LatLngTuple[], {
        color: color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: 0.3,
        className: `heat-zone heat-zone-${zone.risk_level}`,
      });

      // Add tooltip
      polygon.bindTooltip(`<div class="heat-zone-tooltip">
        <strong>${zone.name}</strong><br/>
        Risk: ${zone.risk_level.toUpperCase()}<br/>
        Temp: ${zone.avg_temperature_f}°F (${zone.min_temperature_f}°F - ${zone.max_temperature_f}°F)
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'heat-zone-tooltip',
      });

      polygon.addTo(layerRef.current!);
      newZoneLayers.set(zone.zone_id, polygon);
    });

    setZoneLayers(newZoneLayers);
    setHeatLayer(layerRef.current);
  }, []);

  // Cleanup
  const clearHeatLayer = useCallback(() => {
    if (layerRef.current) {
      layerRef.current.clearLayers();
    }
    // Don't set state to null - that triggers re-renders
    // The layer is still valid, just empty
  }, []);

  // Update on zones change
  useEffect(() => {
    if (zones && zones.length > 0) {
      updateHeatLayer(zones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones]);

  return {
    heatLayer,
    zoneLayers,
    updateHeatLayer,
    clearHeatLayer,
  };
};

// Helper function to get color based on risk level
const getZoneColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return '#10b981';
    case 'moderate':
      return '#f59e0b';
    case 'high':
      return '#ea580c';
    case 'extreme':
      return '#dc2626';
    case 'critical':
      return '#7f1d1d';
    default:
      return '#3b82f6';
  }
};

// ============================================================================
// Hook for Marker Management
// ============================================================================

import { EmergencyLocation } from '@/types';

export const useMarkerLayer = (locations: EmergencyLocation[] = []) => {
  const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | null>(null);
  const [markers, setMarkers] = useState<Map<string, L.Marker>>(new Map());
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Create custom icons
  const createIcon = useCallback((type: string, riskLevel: string) => {
    const iconMap: Record<string, { icon: string; className: string }> = {
      hospital: { icon: '🏥', className: 'marker-hospital' },
      cooling_center: { icon: '❄️', className: 'marker-cooling' },
      fire_station: { icon: '🚒', className: 'marker-fire' },
      police_station: { icon: '👮', className: 'marker-police' },
      shelter: { icon: '🏠', className: 'marker-shelter' },
    };

    const config = iconMap[type] || iconMap.hospital;
    const color = getZoneColor(riskLevel);

    return L.divIcon({
      html: `<div class="custom-marker ${config.className}" style="background-color: ${color};">${config.icon}</div>`,
      className: 'custom-marker-wrapper',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  // Update marker layer
  const updateMarkerLayer = useCallback((newLocations: EmergencyLocation[] = []) => {
    if (!layerRef.current) {
      layerRef.current = L.layerGroup();
      setMarkerLayer(layerRef.current);
    } else {
      layerRef.current.clearLayers();
    }

    const newMarkers = new Map<string, L.Marker>();

    newLocations.forEach((location) => {
      const icon = createIcon(location.type, location.risk_level);
      
      const marker = L.marker([location.latitude, location.longitude], {
        icon,
        title: location.name,
        zIndexOffset: location.risk_level === 'extreme' ? 1000 : 
                     location.risk_level === 'high' ? 500 : 0,
      });

      // Add popup
      marker.bindPopup(`
        <div class="marker-popup">
          <h4>${location.name}</h4>
          <p><strong>Type:</strong> ${location.type.replace('_', ' ')}</p>
          <p><strong>Risk:</strong> ${location.risk_level.toUpperCase()}</p>
          <p><strong>Temp:</strong> ${location.temperature}°F</p>
          ${location.address ? `<p><strong>Address:</strong> ${location.address}</p>` : ''}
          ${location.capacity ? `<p><strong>Capacity:</strong> ${location.capacity}</p>` : ''}
          ${location.contact ? `<p><strong>Contact:</strong> ${location.contact}</p>` : ''}
        </div>
      `);

      marker.addTo(layerRef.current!);
      newMarkers.set(location.id, marker);
    });

    setMarkers(newMarkers);
    setMarkerLayer(layerRef.current);
  }, [createIcon]);

  // Cleanup
  const clearMarkerLayer = useCallback(() => {
    if (layerRef.current) {
      layerRef.current.clearLayers();
    }
    // Don't set state to null - that triggers re-renders
  }, []);

  // Update on locations change
  useEffect(() => {
    if (locations && locations.length > 0) {
      updateMarkerLayer(locations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  return {
    markerLayer,
    markers,
    updateMarkerLayer,
    clearMarkerLayer,
  };
};

// ============================================================================
// Hook for Route Management
// ============================================================================

import { PlannedRoute, RouteOption } from '@/types';

export const useRouteLayer = () => {
  const [routeLayer, setRouteLayer] = useState<L.LayerGroup | null>(null);
  const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<L.Marker[]>([]);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Draw route on map
  const drawRoute = useCallback((route: PlannedRoute) => {
    clearRoute();

    layerRef.current = L.layerGroup();
    setRouteLayer(layerRef.current);

    // Draw polyline for the route
    const waypoints: [number, number][] = [];
    route.segments.forEach((segment) => {
      waypoints.push([segment.start.latitude, segment.start.longitude]);
      waypoints.push([segment.end.latitude, segment.end.longitude]);
    });

    const color = getZoneColor(route.risk_level);
    const polyline = L.polyline(waypoints, {
      color: color,
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    });

    polyline.bindPopup(`
      <div class="route-popup">
        <h4>${route.start_location} → ${route.end_location}</h4>
        <p><strong>Distance:</strong> ${route.total_distance_km.toFixed(1)} km</p>
        <p><strong>Time:</strong> ${route.total_time_min.toFixed(0)} min</p>
        <p><strong>Avg Temp:</strong> ${route.avg_temperature}°F</p>
        <p><strong>Max Temp:</strong> ${route.max_temperature}°F</p>
        <p><strong>Risk:</strong> ${route.risk_level.toUpperCase()}</p>
      </div>
    `);

    polyline.addTo(layerRef.current);
    setRouteLine(polyline);

    // Add start and end markers
    const startMarker = L.marker([route.start_coords[0], route.start_coords[1]], {
      icon: L.divIcon({
        html: '<div class="route-marker start">START</div>',
        className: 'route-marker-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
      zIndexOffset: 1000,
    }).bindPopup(`<strong>Start:</strong> ${route.start_location}`);

    const endMarker = L.marker([route.end_coords[0], route.end_coords[1]], {
      icon: L.divIcon({
        html: '<div class="route-marker end">END</div>',
        className: 'route-marker-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
      zIndexOffset: 1000,
    }).bindPopup(`<strong>End:</strong> ${route.end_location}`);

    startMarker.addTo(layerRef.current);
    endMarker.addTo(layerRef.current);
    setRouteMarkers([startMarker, endMarker]);

    // Fit bounds to show entire route
    return L.latLngBounds(waypoints as L.LatLngExpression[]);
  }, []);

  // Draw route option (simplified)
  const drawRouteOption = useCallback((option: RouteOption) => {
    clearRoute();

    layerRef.current = L.layerGroup();
    setRouteLayer(layerRef.current);

    const polyline = L.polyline(option.waypoints as L.LatLngTuple[], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
    });

    polyline.bindPopup(`
      <div class="route-popup">
        <h4>${option.route_name}</h4>
        <p><strong>Distance:</strong> ${option.distance_km} km</p>
        <p><strong>Time:</strong> ${option.estimated_time_min} min</p>
        <p><strong>Avg Temp:</strong> ${option.avg_temperature}°F</p>
        <p><strong>Max Temp:</strong> ${option.max_temperature}°F</p>
      </div>
    `);

    polyline.addTo(layerRef.current);
    setRouteLine(polyline);

    return L.latLngBounds(option.waypoints as L.LatLngExpression[]);
  }, []);

  // Clear route
  const clearRoute = useCallback(() => {
    if (layerRef.current) {
      layerRef.current.clearLayers();
    }
    // Don't set state to null - that triggers re-renders
  }, []);

  return {
    routeLayer,
    routeLine,
    routeMarkers,
    drawRoute,
    drawRouteOption,
    clearRoute,
  };
};
