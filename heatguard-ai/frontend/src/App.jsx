import React from 'react';
import Layout from '@/components/Layout';
import { DashboardOverview } from '@/components/dashboard';
import { Track1ResilientCities } from '@/components/Track1ResilientCities';
import { RoutePlanner } from '@/components/RoutePlanner';
import { Track6AgentTools } from '@/components/Track6AgentTools';
import { ApiExplorer } from '@/components/ApiExplorer';
import { useState } from 'react';

// Mock city data for demo
const CITIES = [
  { id: 1, name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
  { id: 2, name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { id: 3, name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { id: 4, name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { id: 5, name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 }
];

function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const showToast = (message, type) => {
    // Simple toast implementation - in a real app you'd use a toast library
    alert(`${type.toUpperCase()}: ${message}`);
  };

  return (
    <Layout>
      <div className='min-h-screen bg-gradient-to-br from-background-primary to-background-secondary'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-border-color'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-accent-orange to-acred-yellow rounded-full flex items-center justify-center'>
                <div className='text-xs font-bold text-white'>HG</div>
              </div>
              <h1 className='text-2xl font-bold text-text-primary'>HeatGuard AI Dashboard</h1>
            </div>
          </div>
          
          {/* City Selector */}
          <div className='relative'>
            <label className='block text-sm font-medium text-text-muted mb-1'>Select City</label>
            <select
              value={selectedCity.id}
              onChange={(e) => setSelectedCity(CITIES.find(c => c.id === parseInt(e.target.value)))}
              className='w-full px-3 py-2 border border-border-color rounded-md bg-background-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange'
            >
              {CITIES.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* User Info */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-accent-orange to-acred-yellow rounded-full flex items-center justify-center'>
              <div className='text-xs font-bold text-white'>DJ</div>
            </div>
            <div className='text-text-primary font-medium'>Dharmendra</div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className='flex px-6 py-2 border-b border-border-color'>
          <button
            className={`
              flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'dashboard' 
                ? 'bg-background-hover text-text-primary border-b-2 border-accent-orange' 
                : 'text-text-muted hover:bg-background-hover hover:text-text-primary'
              }
            `}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard Overview
          </button>
          <button
            className={`
              flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'track1' 
                ? 'bg-background-hover text-text-primary border-b-2 border-accent-orange' 
                : 'text-text-muted hover:bg-background-hover hover:text-text-primary'
              }
            `}
            onClick={() => setActiveTab('track1')}
          >
            Track 1: Resilient Cities
          </button>
          <button
            className={`
              flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'route' 
                ? 'bg-background-hover text-text-primary border-b-2 border-accent-orange' 
                : 'text-text-muted hover:bg-background-hover hover:text-text-primary'
              }
            `}
            onClick={() => setActiveTab('route')}
          >
            Route Planner
          </button>
          <button
            className={`
              flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'agent' 
                ? 'bg-background-hover text-text-primary border-b-2 border-accent-orange' 
                : 'text-text-muted hover:bg-background-hover hover:text-text-primary'
              }
            `}
            onClick={() => setActiveTab('agent')}
          >
            Track 6: Agent Tools
          </button>
          <button
            className={`
              flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'api' 
                ? 'bg-background-hover text-text-primary border-b-2 border-accent-orange' 
                : 'text-text-muted hover:bg-background-hover hover:text-text-primary'
              }
            `}
            onClick={() => setActiveTab('api')}
          >
            API Explorer
          </button>
        </div>
        
        {/* Tab Content */}
        <div className='flex-1 overflow-hidden'>
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              selectedCity={selectedCity} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'track1' && (
            <Track1ResilientCities 
              selectedCity={selectedCity} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'route' && (
            <RoutePlanner 
              selectedCity={selectedCity} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'agent' && (
            <Track6AgentTools 
              showToast={showToast} 
            />
          )}
          {activeTab === 'api' && (
            <ApiExplorer />
          )}
        </div>
        
        {/* Footer */}
        <div className='px-6 py-4 border-t border-border-color text-center text-xs text-text-muted'>
          HeatGuard AI Dashboard • Powered by FortyGuard Temperature API • 
          <span className='text-accent-orange'>Demo Mode Active</span>
        </div>
      </div>
    </Layout>
  );
}

export default App;