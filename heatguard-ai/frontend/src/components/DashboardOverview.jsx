import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Custom icon for markers
const getIcon = () => {
  return new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });
};

const DashboardOverview = ({ selectedCity, showToast }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Generate some random heat points around the selected city
    const generateMarkers = () => {
      const points = [];
      const baseLat = selectedCity.lat;
      const baseLng = selectedCity.lng;
      for (let i = 0; i < 10; i++) {
        const latOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees
        const lngOffset = (Math.random() - 0.5) * 0.1;
        points.push({
          position: [baseLat + latOffset, baseLng + lngOffset],
          temperature: Math.floor(Math.random() * 20) + 25, // 25-45°C
          risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        });
      }
      setMarkers(points);
    };
    generateMarkers();
  }, [selectedCity.lat, selectedCity.lng]);

  if (!map) {
    return <div>Loading map...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Stats Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Current Temperature</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <div className='text-3xl font-bold text-text-primary'>
              {Math.floor(Math.random() * 10) + 35}°C
            </div>
            <p className='text-text-muted'>Feels like 38°C</p>
          </CardContent>
        </Card>
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Heat Risk Level</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <div className='w-3 h-3 bg-accent-orange rounded-full'></div>
              <span className='font-medium'>Moderate</span>
            </div>
            <p className='text-text-muted'>Index: 6.2/10</p>
          </CardContent>
        </Card>
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Alerts Active</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <div className='text-3xl font-bold text-accent-orange'>
              2
            </div>
            <p className='text-text-muted'>Heat advisories</p>
          </CardContent>
        </Card>
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Cool Spots</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <div className='text-3xl font-bold text-text-primary'>
              5
            </div>
            <p className='text-text-muted'>Available locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Map and Controls */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Map */}
        <Card className='lg:col-span-2 bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Live Heat Map</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div style={{ height: '400px', width: '100%' }}>
              <Map
                center={[selectedCity.lat, selectedCity.lng]}
                zoom={13}
                whenCreated={setMap}
                scrollWheelZoom={false}
              >
                {/* Tile Layer */}
                <L.TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Markers */}
                {markers.map((marker, index) => (
                  <L.Marker
                    key={index}
                    position={marker.position}
                    icon={getIcon()}
                  >
                    <L.Popup>
                      <div className='text-sm'>
                        <strong>Temperature:</strong> {marker.temperature}°C<br/>
                        <strong>Risk Level:</strong> 
                        <span className={`text-${marker.risk === 'high' ? 'accent-red' : marker.risk === 'medium' ? 'accent-yellow' : 'accent-green'}`}>
                          {marker.risk.charAt(0).toUpperCase() + marker.risk.slice(1)}
                        </span>
                      </div>
                    </L.Popup>
                  </L.Marker>
                ))}
              </Map>
            </div>
          </CardContent>
        </Card>

        {/* Controls Panel */}
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => showToast('Generating heat resilience plan...', 'info')}
            >
              Generate Resilience Plan
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => showToast('Exporting heat map data...', 'info')}
            >
              Export Map Data
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => showToast('Setting up alert notifications...', 'info')}
            >
              Configure Alerts
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => showToast('Loading historical data...', 'info')}
            >
              View Trends
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='bg-background-card border-border-color'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-text-muted text-sm'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-accent-orange rounded-full mt-1'></div>
              <div className='flex-1'>
                <p className='text-text-muted text-sm'>Updated heat thresholds for {selectedCity.name}</p>
                <time className='text-xs text-text-muted'>2 min ago</time>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-accent-yellow rounded-full mt-1'></div>
              <div className='flex-1'>
                <p className='text-text-muted text-sm'>New cool spot identified at Central Park</p>
                <time className='text-xs text-text-muted'>15 min ago</time>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-accent-red rounded-full mt-1'></div>
              <div className='flex-1'>
                <p className='text-text-muted text-sm'>Heat alert issued for downtown area</p>
                <time className='text-xs text-text-muted'>1 hour ago</time>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;