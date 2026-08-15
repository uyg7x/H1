// Mock API service for FortyGuard Temperature API
// Set USE_REAL_API to true when you have an actual API key

const USE_REAL_API = false;
const API_KEY = 'your-api-key-here'; // Replace with actual key when available
const BASE_URL = 'https://api.fortyguard.com/v1';

// Helper function to make API requests
const fetchApi = async (endpoint, options = {}) => {
  if (USE_REAL_API && API_KEY) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Return mock data for demo purposes
  return mockResponse(endpoint, options);
};

// Mock data generators
const mockResponse = (endpoint, options) => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      let data;
      
      switch (endpoint) {
        case '/v1/heat-intelligence':
          if (options.method === 'POST') {
            data = {
              success: true,
              data: {
                location: options.body.location,
                risk_level: options.body.risk_level || 'moderate',
                temperature_f: Math.floor(Math.random() * 20) + 80,
                heat_index: Math.floor(Math.random() * 15) + 90,
                timestamp: new Date().toISOString(),
                recommendations: [
                  'Stay hydrated and seek shade',
                  'Limit outdoor activities during peak heat hours',
                  'Use cooling centers if available'
                ]
              }
            };
          } else {
            data = {
              success: true,
              data: {
                location: 'Phoenix, AZ',
                risk_level: 'high',
                temperature_f: 102,
                heat_index: 115,
                timestamp: new Date().toISOString(),
                recommendations: [
                  'Extreme heat warning in effect',
                  'Seek air-conditioned environments',
                  'Check on vulnerable neighbors'
                ]
              }
            };
          }
          break;
          
        case '/v1/snapshot':
          const points = [];
          for (let i = 0; i < (options.params?.radius || 5); i++) {
            points.push({
              lat: 33.4484 + (Math.random() - 0.5) * 0.1,
              lng: -112.0740 + (Math.random() - 0.5) * 0.1,
              temperature: Math.floor(Math.random() * 25) + 80,
              risk: Math.random() > 0.7 ? 'extreme' : Math.random() > 0.4 ? 'high' : 'moderate'
            });
          }
          data = { success: true, data: { points } };
          break;
          
        case '/v1/exceedance':
          data = {
            success: true,
            data: {
              location: options.params?.location || 'Phoenix, AZ',
              threshold: options.params?.threshold || 100,
              days: options.params?.days || 7,
              exceedance_count: Math.floor(Math.random() * 5) + 2,
              max_temperature: Math.floor(Math.random() * 10) + 105,
              avg_temperature: Math.floor(Math.random() * 5) + 98
            }
          };
          break;
          
        case '/v1/persistence':
          data = {
            success: true,
            data: {
              location: options.params?.location || 'Phoenix, AZ',
              hours: options.params?.hours || 24,
              persistence_score: Math.floor(Math.random() * 40) + 60,
              max_consecutive_hours: Math.floor(Math.random() * 8) + 4,
              avg_temperature: Math.floor(Math.random() * 10) + 95
            }
          };
          break;
          
        case '/v1/route-analysis':
          data = {
            success: true,
            data: {
              total_distance_mi: Math.floor(Math.random() * 10) + 5,
              estimated_time_min: Math.floor(Math.random() * 30) + 20,
              avg_temp_f: Math.floor(Math.random() * 15) + 85,
              max_temp_f: Math.floor(Math.random() * 10) + 100,
              heat_exposure_score: Math.floor(Math.random() * 30) + 40,
              recommendations: [
                'Consider leaving earlier to avoid peak heat',
                'Route includes shaded paths and cooling stations',
                'Bring water and sun protection'
              ]
            }
          };
          break;
          
        case '/v1/agent-tools':
          data = {
            success: true,
            data: {
              response: `Processed request for ${options.body.agent || 'HeatRiskBot'}: ${options.body.query || 'No query provided'}. Analysis complete with 95% confidence.`,
              confidence: 0.9 + Math.random() * 0.1,
              execution_time_ms: Math.floor(Math.random() * 500) + 100,
              timestamp: new Date().toISOString()
            }
          };
          break;
          
        default:
          data = { success: true, data: { message: 'Endpoint not implemented in mock' } };
      }
      
      resolve(data);
    }, 500); // Simulate 500ms network delay
  });
};

// API service methods
const apiService = {
  // Heat Intelligence endpoints
  getHeatIntelligence: (location) => fetchApi(`/v1/heat-intelligence?location=${encodeURIComponent(location)}`),
  postHeatIntelligence: (data) => fetchApi('/v1/heat-intelligence', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Snapshot endpoint
  getSnapshot: (lat, lng, radius) => fetchApi(`/v1/snapshot?lat=${lat}&lng=${lng}&radius=${radius}`),
  
  // Exceedance endpoint
  getExceedance: (location, threshold, days) => fetchApi(`/v1/exceedance?location=${encodeURIComponent(location)}&threshold=${threshold}&days=${days}`),
  
  // Persistence endpoint
  getPersistence: (location, hours) => fetchApi(`/v1/persistence?location=${encodeURIComponent(location)}&hours=${hours}`),
  
  // Route analysis endpoint
  analyzeRoute: (waypoints) => fetchApi('/v1/route-analysis', {
    method: 'POST',
    body: JSON.stringify({ waypoints })
  }),
  
  // Agent tools endpoint
  agentTools: (agent, query) => fetchApi('/v1/agent-tools', {
    method: 'POST',
    body: JSON.stringify({ agent, query })
  }),
  
  // City-specific methods (for Track 1)
  getCityInfo: (cityId) => fetchApi(`/v1/cities/${cityId}`),
  getHeatAudit: (cityId) => fetchApi(`/v1/cities/${cityId}/heat-audit`),
  getDigitalTwin: (cityId, scenario) => fetchApi(`/v1/cities/${cityId}/digital-twin?scenario=${scenario}`),
  
  // Helper methods for UI components
  getRoutePoints: () => [
    { id: 1, name: 'Central Station', lat: 33.45, lng: -112.07, temp: 98, risk: 'high' },
    { id: 2, name: 'Green Park', lat: 33.46, lng: -112.06, temp: 92, risk: 'moderate' },
    { id: 3, name: 'Riverside Walk', lat: 33.44, lng: -112.08, temp: 95, risk: 'high' },
    { id: 4, name: 'Downtown Plaza', lat: 33.45, lng: -112.05, temp: 101, risk: 'extreme' },
    { id: 5, name: 'University Campus', lat: 33.47, lng: -112.09, temp: 90, risk: 'moderate' },
    { id: 6, name: 'Industrial Zone', lat: 33.43, lng: -112.04, temp: 105, risk: 'extreme' },
    { id: 7, name: 'Residential District', lat: 33.48, lng: -112.07, temp: 88, risk: 'low' },
    { id: 8, name: 'Shopping Mall', lat: 33.44, lng: -112.06, temp: 97, risk: 'high' }
  ],
  
  getApiEndpoints: () => [
    {
      endpoint: '/v1/heat-intelligence',
      method: 'GET',
      description: 'Get current heat risk and temperature for a location',
      params: ['location']
    },
    {
      endpoint: '/v1/heat-intelligence',
      method: 'POST',
      description: 'Post heat intelligence data for analysis',
      params: ['location', 'risk_level']
    },
    {
      endpoint: '/v1/snapshot',
      method: 'GET',
      description: 'Get hyperlocal temperature snapshot around coordinates',
      params: ['lat', 'lng', 'radius']
    },
    {
      endpoint: '/v1/exceedance',
      method: 'GET',
      description: 'Get temperature exceedance statistics',
      params: ['location', 'threshold', 'days']
    },
    {
      endpoint: '/v1/persistence',
      method: 'GET',
      description: 'Get temperature persistence metrics',
      params: ['location', 'hours']
    },
    {
      endpoint: '/v1/route-analysis',
      method: 'POST',
      description: 'Analyze route for heat exposure',
      params: ['waypoints']
    },
    {
      endpoint: '/v1/agent-tools',
      method: 'POST',
      description: 'Access Temperature API as agent tools',
      params: ['agent', 'query']
    }
  ],
  
  getAgentLogs: () => [
    {
      id: 1,
      timestamp: '2026-08-14 14:30:22',
      agent: 'HeatRiskBot',
      action: 'Processed: Analyze downtown Phoenix heat risk',
      result: 'High risk detected - recommend cooling center activation',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2026-08-14 14:25:10',
      agent: 'RouteOptimizer',
      action: 'Processed: Generate cool route from ASU to downtown',
      result: 'Route optimized - 2.3 miles, 15°F cooler than direct path',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2026-08-14 14:20:05',
      agent: 'AlertDispatcher',
      action: 'Processed: Send heat alert to 50K residents',
      result: 'Alert delivered via SMS and app notifications',
      status: 'success'
    }
  ]
};

export default apiService;