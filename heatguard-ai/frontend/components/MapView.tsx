// ============================================================================
// HeatGuard AI - Geospatial Command Center
// Interactive A/B heat-routing engine on a dark glass dashboard.
// - Click "Set Start" / "Set End" then click the map: both routes regenerate
//   between your points (fast = straight through heat traps, safe = bowed
//   through parks/shelters) with metrics computed from a synthetic hyperlocal
//   heat field emulating the FortyGuard 2m-above-ground API.
// ============================================================================

import { useMemo, useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Tooltip,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import type { LatLng } from 'leaflet';
import L from 'leaflet';
import {
  Navigation,
  Shield,
  Dog,
  Zap,
  MapPin,
  Snowflake,
  AlertTriangle,
  Thermometer,
  Route as RouteIcon,
  X,
  ChevronUp,
  RotateCcw,
  Clock,
  Footprints,
  Flame,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ProfileType = 'healthy' | 'elderly' | 'dog';
type RouteMode = 'fast' | 'safe';
type ClickMode = 'none' | 'start' | 'end';

interface Shelter {
  id: number;
  pos: [number, number];
  name: string;
  kind: string;
  temp: number;
  hours: string;
}

interface HeatTrap {
  id: number;
  name: string;
  surface: string;
  temp: number; // °F at 2m above ground
  radius: number; // meters of thermal influence
  polygon: [number, number][]; // irregular city-block shape
}

interface RouteResult {
  points: [number, number][];
  segments: { a: [number, number]; b: [number, number]; temp: number; color: string }[];
  distanceKm: number;
  durationMin: number;
  avgTemp: number;
  maxTemp: number;
  risk: 'extreme' | 'high' | 'moderate' | 'low';
}

// ============================================================================
// Hyperlocal fixtures (emulates FortyGuard 10m-resolution readings)
// ============================================================================

const AMBIENT_F = 97;

const HEAT_TRAPS: HeatTrap[] = [
  {
    id: 1,
    name: 'Central Avenue Asphalt Plaza',
    surface: 'Asphalt intersection',
    temp: 118,
    radius: 260,
    polygon: [
      [33.4560, -112.0710],
      [33.4568, -112.0690],
      [33.4560, -112.0672],
      [33.4548, -112.0678],
      [33.4544, -112.0698],
      [33.4552, -112.0712],
    ],
  },
  {
    id: 2,
    name: 'Union Station Parking Deck',
    surface: 'Concrete parking lot',
    temp: 115,
    radius: 210,
    polygon: [
      [33.4506, -112.0748],
      [33.4514, -112.0736],
      [33.4508, -112.0722],
      [33.4496, -112.0726],
      [33.4492, -112.0742],
    ],
  },
  {
    id: 3,
    name: 'Grand Blvd Concrete Plaza',
    surface: 'Unshaded concrete plaza',
    temp: 116,
    radius: 230,
    polygon: [
      [33.4602, -112.0658],
      [33.4610, -112.0642],
      [33.4602, -112.0626],
      [33.4590, -112.0636],
      [33.4592, -112.0654],
    ],
  },
];

const SHELTERS: Shelter[] = [
  { id: 1, pos: [33.4536, -112.0764], name: 'Central Library', kind: 'Public Cooling Shelter', temp: 68, hours: 'Open until 9 PM' },
  { id: 2, pos: [33.4582, -112.0712], name: 'Encanto Community Center', kind: 'City Cooling Station', temp: 70, hours: 'Open 24/7' },
  { id: 3, pos: [33.4552, -112.0730], name: 'Cooling Oasis Mall', kind: 'Retail Micro-Oasis', temp: 65, hours: 'Open until 10 PM' },
  { id: 4, pos: [33.4618, -112.0666], name: 'Roosevelt Water Park', kind: 'Mist Plaza', temp: 78, hours: 'Open until dusk' },
];

const DEFAULT_START: [number, number] = [33.4484, -112.0760];
const DEFAULT_END: [number, number] = [33.4634, -112.0620];

// ============================================================================
// Geo math
// ============================================================================

const R_EARTH_KM = 6371;

function haversineKm(a: [number, number], b: [number, number]): number {
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}

const metersBetween = (a: [number, number], b: [number, number]) => haversineKm(a, b) * 1000;

/** Synthetic 2m-above-ground temperature at any point (FortyGuard-style field). */
function sampleHeat(lat: number, lng: number): number {
  let t = AMBIENT_F;
  for (const trap of HEAT_TRAPS) {
    const d = metersBetween([lat, lng], trap.polygon[0]) * 0.5 +
      metersBetween([lat, lng], trap.polygon[Math.floor(trap.polygon.length / 2)]) * 0.5;
    const sigma = trap.radius * 0.6;
    t += Math.exp(-(d * d) / (2 * sigma * sigma)) * (trap.temp - AMBIENT_F);
  }
  return Math.min(Math.round(t * 10) / 10, 124);
}

function heatColor(t: number): string {
  if (t >= 112) return '#dc2626';
  if (t >= 106) return '#f97316';
  if (t >= 101) return '#f59e0b';
  if (t >= 96) return '#facc15';
  if (t >= 92) return '#a3e635';
  return '#22c55e';
}

function riskFor(t: number): RouteResult['risk'] {
  if (t >= 110) return 'extreme';
  if (t >= 102) return 'high';
  if (t >= 95) return 'moderate';
  return 'low';
}

/** Deterministic PRNG so routes are stable between re-renders. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sumRoute(points: [number, number][]): { samples: number[]; distanceKm: number } {
  const samples: number[] = [];
  let dist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    dist += haversineKm(points[i], points[i + 1]);
    const mid: [number, number] = [
      (points[i][0] + points[i + 1][0]) / 2,
      (points[i][1] + points[i + 1][1]) / 2,
    ];
    samples.push(sampleHeat(mid[0], mid[1]));
  }
  return { samples, distanceKm: dist };
}

function buildResult(
  points: [number, number][],
  speedKmh: number,
): RouteResult {
  const { samples, distanceKm } = sumRoute(points);
  const avgTemp = Math.round(samples.reduce((s, v) => s + v, 0) / Math.max(samples.length, 1));
  const maxTemp = Math.round(Math.max(...samples, AMBIENT_F));
  const segments = points.slice(0, -1).map((a, i) => {
    const temp = samples[i];
    return { a, b: points[i + 1], temp, color: heatColor(temp) };
  });
  return {
    points,
    segments,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.max(1, Math.round((distanceKm / speedKmh) * 60)),
    avgTemp,
    maxTemp,
    risk: riskFor(avgTemp),
  };
}

/**
 * Generate A/B routes between any two clicked points.
 * Fast: near-straight "street-grid" staircase straight through heat traps.
 * Safe: smooth bow offset toward the nearest cooling shelter / park side.
 */
function generateRoutes(start: [number, number], end: [number, number]) {
  const seed = Math.floor((start[0] + start[1] + end[0] + end[1]) * 10000);
  const rand = mulberry32(Math.abs(seed) || 1);
  const N = 26;

  const dLat = end[0] - start[0];
  const dLng = end[1] - start[1];
  const len = Math.hypot(dLat, dLng) || 1e-9;
  // perpendicular unit vector in degree space
  const px = -dLng / len;
  const py = dLat / len;

  // ---- Fast route: street-grid staircase with light jitter ----
  const fast: [number, number][] = [];
  const gridStep = 2; // alternate horizontal / vertical "streets"
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const baseLat = start[0] + dLat * t;
    const baseLng = start[1] + dLng * t;
    const j = (rand() - 0.5) * 0.0006;
    if (i % gridStep === 0) {
      fast.push([baseLat + j, baseLng]);
    } else {
      fast.push([baseLat, baseLng + j]);
    }
  }
  fast[0] = [...start] as [number, number];
  fast[fast.length - 1] = [...end] as [number, number];

  // ---- Safe route: bow that avoids heat traps and brushes the best shelter ----
  const mid: [number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

  // shelter attraction vector decides which side each candidate bow leans to
  let target = SHELTERS[0];
  let best = Infinity;
  for (const s of SHELTERS) {
    const d = metersBetween(mid, s.pos);
    if (d < best) {
      best = d;
      target = s;
    }
  }
  const toShelter = { x: target.pos[1] - mid[1], y: target.pos[0] - mid[0] };
  const dot = toShelter.x * px + toShelter.y * py;
  const shelterSide = dot >= 0 ? 1 : -1;

  const bowMax = Math.min(len * 0.3, 0.012); // cap the detour

  const buildBow = (side: number, apexPull: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const bow = Math.sin(Math.PI * t) * bowMax * side;
      const wobble = Math.sin(t * Math.PI * 6) * 0.00022 * (rand() > 0.5 ? 1 : -1);
      pts.push([
        start[0] + dLat * t + py * bow + wobble,
        start[1] + dLng * t + px * bow + wobble * 0.6,
      ]);
    }
    // pull the apex toward the shelter so the route visibly brushes the oasis
    const apexIdx = Math.floor(N / 2);
    pts[apexIdx] = [
      pts[apexIdx][0] * (1 - apexPull) + target.pos[0] * apexPull,
      pts[apexIdx][1] * (1 - apexPull) + target.pos[1] * apexPull,
    ];
    pts[0] = [...start] as [number, number];
    pts[pts.length - 1] = [...end] as [number, number];
    return pts;
  };

  // pick the side whose total street-level heat is lower (shelter side breaks ties)
  const heatOf = (pts: [number, number][]) =>
    sumRoute(pts).samples.reduce((s, v) => s + v, 0);
  const towards = buildBow(shelterSide, 0.45);
  const away = buildBow(-shelterSide, 0.2);
  const safe = heatOf(towards) <= heatOf(away) ? towards : away;

  return {
    fast: buildResult(fast, 22), // km/h city pace
    safe: buildResult(safe, 16),
  };
}

// ============================================================================
// Leaflet custom icons (divIcons — no default marker assets needed)
// ============================================================================

const shelterIcon = L.divIcon({
  className: '',
  html: `<div class="shelter-pin">🧊</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const startIcon = L.divIcon({
  className: '',
  html: `<div class="waypoint-pin" style="background:linear-gradient(135deg,#22c55e,#16a34a)"><span>🚩</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const endIcon = L.divIcon({
  className: '',
  html: `<div class="waypoint-pin" style="background:linear-gradient(135deg,#ef4444,#dc2626)"><span>🏁</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// ============================================================================
// Map helpers
// ============================================================================

function MapClickHandler({
  clickMode,
  onSetPoint,
}: {
  clickMode: ClickMode;
  onSetPoint: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      if (clickMode !== 'none') onSetPoint(e.latlng);
    },
  });
  return null;
}

/** Keeps the viewport framed on the active route whenever points change. */
function MapController({
  start,
  end,
}: {
  start: [number, number] | null;
  end: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      map.fitBounds(L.latLngBounds(start, end), {
        padding: [80, 80],
        maxZoom: 15,
      });
    } else if (start || end) {
      map.flyTo((start ?? end) as [number, number], 14, { duration: 0.8 });
    }
  }, [start, end, map]);
  return null;
}

/** Distance (meters) from a point to the nearest vertex of a route. */
function distanceFromRoute(route: [number, number][], point: [number, number]): number {
  let best = Infinity;
  for (const p of route) best = Math.min(best, metersBetween(p, point));
  return Math.round(best);
}

// ============================================================================
// Main component
// ============================================================================

export default function MapView() {
  const [profile, setProfile] = useState<ProfileType>('healthy');
  const [routeMode, setRouteMode] = useState<RouteMode>('safe');
  const [clickMode, setClickMode] = useState<ClickMode>('none');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [startPoint, setStartPoint] = useState<[number, number] | null>(DEFAULT_START);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(DEFAULT_END);

  const routes = useMemo(
    () => (startPoint && endPoint ? generateRoutes(startPoint, endPoint) : null),
    [startPoint, endPoint],
  );

  const activeRoute: RouteMode = profile === 'healthy' ? routeMode : 'safe';
  const showFast = profile === 'healthy';

  const handleProfileChange = (p: ProfileType) => {
    setProfile(p);
    if (p !== 'healthy') setRouteMode('safe');
  };

  const handleMapClick = (latlng: LatLng) => {
    const pt: [number, number] = [
      Math.round(latlng.lat * 10000) / 10000,
      Math.round(latlng.lng * 10000) / 10000,
    ];
    if (clickMode === 'start') setStartPoint(pt);
    if (clickMode === 'end') setEndPoint(pt);
    setClickMode('none');
  };

  const resetDemo = () => {
    setStartPoint(DEFAULT_START);
    setEndPoint(DEFAULT_END);
    setClickMode('none');
  };

  return (
    <div className="relative w-full h-[calc(100vh-220px)] min-h-[560px] bg-slate-950 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* ================= Map ================= */}
      <MapContainer
        center={[33.4560, -112.0690]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a> &middot; Heat model: FortyGuard 2m AGL'
        />
        <MapClickHandler clickMode={clickMode} onSetPoint={handleMapClick} />
        <MapController start={startPoint} end={endPoint} />

        {/* ---- Hyperlocal heat-trap polygons (FortyGuard 2m AGL) ---- */}
        {HEAT_TRAPS.map((trap) => (
          <Polygon
            key={trap.id}
            positions={trap.polygon}
            className="heat-trap-pulse"
            pathOptions={{
              color: '#f87171',
              weight: 1.5,
              fillColor: '#ef4444',
              fillOpacity: 0.28,
            }}
          >
            <Tooltip direction="top" sticky>
              <span className="text-xs font-semibold">🔥 {trap.temp}°F</span>
            </Tooltip>
            <Popup>
              <div className="min-w-[200px]">
                <strong>🔥 {trap.name}</strong>
                <p style={{ marginTop: 4 }}>Surface: {trap.surface}</p>
                <p>
                  Hyperlocal temperature: <b>{trap.temp}°F</b> (2m above ground)
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>
                  Thermal influence radius ≈ {trap.radius}m — routed around by Cool Path
                </p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* ---- Routes (segments colored by sampled street-level heat) ---- */}
        {routes && showFast && (
          <>
            {/* glow casing */}
            <Polyline positions={routes.fast.points} pathOptions={{ color: '#7f1d1d', weight: 11, opacity: 0.35 }} />
            {routes.fast.segments.map((seg, i) => (
              <Polyline
                key={`f${i}`}
                positions={[seg.a, seg.b]}
                pathOptions={{
                  color: seg.color,
                  weight: activeRoute === 'fast' ? 6 : 4,
                  opacity: activeRoute === 'fast' ? 1 : 0.35,
                }}
              />
            ))}
          </>
        )}
        {routes && (
          <>
            <Polyline positions={routes.safe.points} pathOptions={{ color: '#065f46', weight: 11, opacity: 0.35 }} />
            {routes.safe.segments.map((seg, i) => (
              <Polyline
                key={`s${i}`}
                positions={[seg.a, seg.b]}
                pathOptions={{
                  color: seg.color,
                  weight: activeRoute === 'safe' ? 6 : 4,
                  opacity: activeRoute === 'safe' ? 1 : 0.35,
                }}
              />
            ))}
            {/* animated flow dashes on the selected route */}
            {activeRoute === 'safe' && (
              <Polyline
                positions={routes.safe.points}
                className="route-dash"
                pathOptions={{ color: '#ffffff', weight: 2.5, opacity: 0.8 }}
              />
            )}
          </>
        )}

        {/* ---- Cooling shelters / micro-oases ---- */}
        {SHELTERS.map((s) => (
          <Marker key={s.id} position={s.pos} icon={shelterIcon}>
            <Popup>
              <div className="min-w-[220px]">
                <strong>🧊 {s.kind}: {s.name}</strong>
                <p style={{ marginTop: 4 }}>AC / mist temp: <b>{s.temp}°F</b></p>
                <p>{s.hours}</p>
                {routes && (
                  <p>
                    Distance from active route:{' '}
                    <b>{distanceFromRoute(routes[activeRoute].points, s.pos)} m</b>
                  </p>
                )}
                <p style={{ fontSize: 11, color: '#94a3b8' }}>
                  Street-level heat outside: {Math.round(sampleHeat(s.pos[0], s.pos[1]))}°F
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ---- Waypoints ---- */}
        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Popup><strong>🚩 Start</strong><p>Heat here: {Math.round(sampleHeat(...startPoint))}°F</p></Popup>
          </Marker>
        )}
        {endPoint && (
          <Marker position={endPoint} icon={endIcon}>
            <Popup><strong>🏁 Destination</strong><p>Heat here: {Math.round(sampleHeat(...endPoint))}°F</p></Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ================= Top controls (glass) ================= */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row md:items-start justify-between gap-3 pointer-events-none">
        {/* Profile switcher */}
        <div className="glass rounded-2xl p-1.5 flex gap-1 pointer-events-auto overflow-x-auto max-w-full">
          <button
            onClick={() => handleProfileChange('healthy')}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              profile === 'healthy' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Zap size={15} /> Healthy Adult
          </button>
          <button
            onClick={() => handleProfileChange('elderly')}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              profile === 'elderly' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Shield size={15} /> Elderly / Asthma
          </button>
          <button
            onClick={() => handleProfileChange('dog')}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              profile === 'dog' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Dog size={15} /> Dog Walker
          </button>
        </div>

        {/* Route A/B toggle + waypoints (desktop) */}
        <div className="flex gap-3 pointer-events-auto">
          {profile === 'healthy' && routes && (
            <div className="glass rounded-2xl p-1.5 flex gap-1 self-start">
              <button
                onClick={() => setRouteMode('fast')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  routeMode === 'fast' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Zap size={15} /> ⚡ Speed
              </button>
              <button
                onClick={() => setRouteMode('safe')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  routeMode === 'safe' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Snowflake size={15} /> 🧊 Safety
              </button>
            </div>
          )}

          <div className="glass rounded-2xl p-1.5 flex gap-1 self-start">
            <button
              onClick={() => setClickMode(clickMode === 'start' ? 'none' : 'start')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all ${
                clickMode === 'start' ? 'bg-green-500 text-white animate-pulse' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <MapPin size={15} /> Set Start
            </button>
            <button
              onClick={() => setClickMode(clickMode === 'end' ? 'none' : 'end')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all ${
                clickMode === 'end' ? 'bg-red-500 text-white animate-pulse' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Navigation size={15} /> Set End
            </button>
            <button
              onClick={resetDemo}
              title="Reset demo points"
              className="px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 transition-all"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= Legend (glass) ================= */}
      <div className="hidden md:block absolute bottom-6 left-4 z-[1000] glass rounded-2xl px-4 py-3 text-xs text-slate-300 space-y-1.5">
        <p className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">Legend</p>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-1 rounded bg-gradient-to-r from-yellow-400 to-red-600" /> Fast route (heat-colored)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-1 rounded bg-gradient-to-r from-green-500 to-lime-400" /> Cool route (heat-colored)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/50 border border-red-400" /> Heat trap (2m AGL)
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🧊</span> Cooling shelter / micro-oasis
        </div>
      </div>

      {/* ================= Mobile FABs ================= */}
      <div className="md:hidden absolute bottom-[210px] right-4 z-[1000] flex flex-col gap-3">
        <button
          onClick={() => setClickMode(clickMode === 'start' ? 'none' : 'start')}
          aria-label="Set start point"
          className={`w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl transition-all ${
            clickMode === 'start' ? 'bg-green-500 text-white scale-110' : 'glass text-white'
          }`}
        >
          <MapPin size={22} />
        </button>
        <button
          onClick={() => setClickMode(clickMode === 'end' ? 'none' : 'end')}
          aria-label="Set end point"
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl transition-all ${
            clickMode === 'end' ? 'bg-red-500 text-white scale-110' : 'glass text-white'
          }`}
        >
          <Navigation size={22} />
        </button>
      </div>

      {/* ================= Desktop HUD sidebar ================= */}
      <div className="hidden lg:flex absolute top-[92px] right-4 bottom-6 w-[340px] z-[1000] flex-col gap-4">
        {routes && (
          <RouteComparisonHUD
            fast={routes.fast}
            safe={routes.safe}
            activeRoute={activeRoute}
            profile={profile}
            onSelectRoute={setRouteMode}
          />
        )}
        <ShelterList routes={routes} activeRoute={activeRoute} />
      </div>

      {/* ================= Mobile bottom sheet ================= */}
      <div
        className={`lg:hidden absolute left-0 right-0 bottom-0 z-[1000] transition-transform duration-300 ${
          isSheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-116px)]'
        }`}
      >
        <div className="glass-strong rounded-t-3xl h-[420px] flex flex-col">
          <button
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            className="w-full pt-3 pb-2 flex flex-col items-center text-slate-400"
          >
            <span className="w-10 h-1 rounded-full bg-white/30 mb-1" />
            <ChevronUp className={`transition-transform ${isSheetOpen ? 'rotate-180' : ''}`} size={18} />
          </button>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {routes && (
              <RouteComparisonHUD
                fast={routes.fast}
                safe={routes.safe}
                activeRoute={activeRoute}
                profile={profile}
                onSelectRoute={setRouteMode}
                compact
              />
            )}
            <ShelterList routes={routes} activeRoute={activeRoute} compact />
          </div>
        </div>
      </div>

      {/* ================= Click-mode banner ================= */}
      {clickMode !== 'none' && (
        <div className="absolute top-[76px] md:top-[76px] left-1/2 -translate-x-1/2 z-[1100] glass-strong text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2">
          <MapPin size={16} className="text-orange-400" />
          Tap the map to set {clickMode === 'start' ? 'START' : 'END'}
          <button onClick={() => setClickMode('none')} className="ml-1 hover:bg-white/20 rounded-full p-1">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Route Comparison HUD (glassmorphism)
// ============================================================================

const RISK_CHIP: Record<RouteResult['risk'], string> = {
  extreme: 'bg-red-500/20 text-red-300 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-300 border-green-500/40',
};

function RouteCard({
  label,
  emoji,
  route,
  active,
  selectable,
  onClick,
  accent,
}: {
  label: string;
  emoji: string;
  route: RouteResult;
  active: boolean;
  selectable: boolean;
  onClick: () => void;
  accent: 'red' | 'green';
}) {
  return (
    <button
      disabled={!selectable}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        active
          ? accent === 'red'
            ? 'bg-red-500/15 border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.25)]'
            : 'bg-green-500/15 border-green-500/50 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
          : 'bg-white/[0.04] border-white/10'
      } ${selectable ? 'cursor-pointer hover:bg-white/[0.08]' : 'cursor-default'} ${
        !active && !selectable ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-sm flex items-center gap-2 text-white">
          {emoji} {label}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${RISK_CHIP[route.risk]}`}>
          {route.risk === 'low' ? '✅ Safe' : route.risk === 'moderate' ? '⚠️ Caution' : route.risk === 'high' ? '⚠️ High Risk' : '⚠️ Extreme'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
        <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> {route.durationMin}m</span>
        <span className="flex items-center gap-1.5"><Thermometer size={13} style={{ color: heatColor(route.avgTemp) }} /> {route.avgTemp}°F</span>
        <span className="flex items-center gap-1.5"><Footprints size={13} className="text-slate-400" /> {route.distanceKm}km</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, ((route.avgTemp - 80) / 44) * 100)}%`, background: heatColor(route.avgTemp) }}
        />
      </div>
    </button>
  );
}

function RouteComparisonHUD({
  fast,
  safe,
  activeRoute,
  profile,
  onSelectRoute,
  compact = false,
}: {
  fast: RouteResult;
  safe: RouteResult;
  activeRoute: RouteMode;
  profile: ProfileType;
  onSelectRoute: (m: RouteMode) => void;
  compact?: boolean;
}) {
  const stressReduction = Math.max(
    0,
    Math.round(((fast.avgTemp - safe.avgTemp) / fast.avgTemp) * 100),
  );
  const extraMin = Math.max(0, safe.durationMin - fast.durationMin);
  const coolerBy = Math.max(0, fast.avgTemp - safe.avgTemp);

  return (
    <div className={`glass hud-panel rounded-3xl p-5 text-white ${compact ? '' : 'flex-1 min-h-0 overflow-y-auto'}`}>
      <h3 className="text-base font-bold mb-1 flex items-center gap-2">
        <RouteIcon size={17} className="text-orange-400" /> Route Intelligence
        <span className="ml-auto text-[10px] font-semibold text-emerald-300 glass-chip px-2 py-0.5 rounded-full border-emerald-400/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
        </span>
      </h3>
      <p className="text-[11px] text-slate-400 mb-4">Street-level heat sampled at 2m AGL along each path</p>

      {profile === 'dog' && (
        <div className="mb-4 p-3 bg-sky-500/15 border border-sky-500/40 rounded-xl text-sky-200 text-xs flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>
            Pavement on Fast Route hits <b>{fast.maxTemp}°F</b> — will burn dog paws. Auto-rerouted to grass &amp; shade.
          </span>
        </div>
      )}
      {profile === 'elderly' && (
        <div className="mb-4 p-3 bg-green-500/15 border border-green-500/40 rounded-xl text-green-200 text-xs flex items-start gap-2">
          <Shield size={15} className="shrink-0 mt-0.5" />
          <span>Vulnerable mode: high-exposure route hidden. Cool Path + 4 shelters prioritized.</span>
        </div>
      )}

      <div className="space-y-3">
        <RouteCard
          label="High-Speed Route"
          emoji="🔴"
          route={fast}
          active={activeRoute === 'fast'}
          selectable={profile === 'healthy'}
          onClick={() => onSelectRoute('fast')}
          accent="red"
        />
        <RouteCard
          label="Cool / Safe Route"
          emoji="🟢"
          route={safe}
          active={activeRoute === 'safe'}
          selectable
          onClick={() => onSelectRoute('safe')}
          accent="green"
        />
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/15 to-green-500/15 border border-orange-500/30 rounded-xl text-xs text-center text-slate-200">
        🧠 Choosing the Cool Route costs <strong>{extraMin} extra min</strong> but is{' '}
        <strong className="text-green-300">{coolerBy}°F cooler</strong> — cutting core body heat stress by{' '}
        <strong className="text-green-300">{stressReduction}%</strong>.
      </div>
    </div>
  );
}

// ============================================================================
// Shelter list (glass)
// ============================================================================

function ShelterList({
  routes,
  activeRoute,
  compact = false,
}: {
  routes: { fast: RouteResult; safe: RouteResult } | null;
  activeRoute: RouteMode;
  compact?: boolean;
}) {
  return (
    <div className={`glass rounded-3xl p-5 text-white ${compact ? '' : 'min-h-[180px] flex-1 flex flex-col'}`}>
      <h3 className="text-base font-bold mb-3 flex items-center gap-2">
        <Snowflake size={17} className="text-sky-400" /> Cooling Shelters
        <span className="ml-auto text-[10px] text-slate-400">Micro-oases near route</span>
      </h3>
      <div className={`space-y-2 ${compact ? '' : 'overflow-y-auto flex-1 pr-1'}`}>
        {SHELTERS.map((s) => {
          const dist = routes ? distanceFromRoute(routes[activeRoute].points, s.pos) : null;
          return (
            <div
              key={s.id}
              className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/[0.08] transition-colors"
            >
              <div>
                <p className="font-bold text-sm">🧊 {s.name}</p>
                <p className="text-[11px] text-slate-400">{s.hours}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-sky-300 font-bold text-sm">{s.temp}°F</p>
                {dist !== null && <p className="text-[10px] text-slate-400">{dist}m off route</p>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5">
        <Flame size={11} className="text-orange-400" />
        Street heat outside shelters reaches {Math.max(...SHELTERS.map((s) => Math.round(sampleHeat(s.pos[0], s.pos[1]))))}°F today
      </p>
    </div>
  );
}
