// ============================================================================
// HeatGuard AI - Main Dashboard Page
// 5-Tab Enterprise-Grade Dashboard for FortyGuard Global AI Hackathon '26
// ============================================================================

import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useAppContext } from '../context/AppContext';
import TabNavigation from '../components/TabNavigation';
import MapView from '../components/MapView';
import AreaDashboard from '../components/AreaDashboard';
import AIChat from '../components/AIChat';
import TrackAnalytics from '../components/TrackAnalytics';
import SettingsPanel from '../components/SettingsPanel';

// ============================================================================
// Dashboard Component
// ============================================================================

const DashboardPage: React.FC = () => {
  const { activeTab, routeMode, setRouteMode, heatData } = useAppContext();

  // Render the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapView routeMode={routeMode} onRouteChange={setRouteMode} />;
      case 'area':
        return <AreaDashboard />;
      case 'ai':
        return <AIChat />;
      case 'analytics':
        return <TrackAnalytics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <MapView routeMode={routeMode} onRouteChange={setRouteMode} />;
    }
  };

  return (
    <>
      <Head>
        <title>HeatGuard AI - Climate Resilience Command Center</title>
        <meta name="description" content="Autonomous AI-powered heat resilience platform for cities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HG</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">HeatGuard AI</h1>
                  <p className="text-xs text-gray-400">Powered by FortyGuard Temperature API</p>
                </div>
              </div>

              {/* Team Badge */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full">
                  <span className="text-white font-semibold text-sm">PJY ->RuST BaBA</span>
                </div>
                
                {/* Live Status */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Live</span>
                </div>
                
                {/* Current Temperature Badge */}
                <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{heatData?.temperature_f || 112}°F</p>
                    <p className="text-xs text-gray-400 capitalize">{heatData?.risk_level || 'extreme'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tab Navigation */}
          <TabNavigation />

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400 text-sm">
              <p>
                Built for FortyGuard Global AI Hackathon &apos;26 | 
                <span className="text-gray-500">Track 01: Resilient Cities & Infrastructure</span> | 
                <span className="text-gray-500">Track 06: AI Agent Tools</span>
              </p>
              <p className="mt-1">
                Powered by FortyGuard Temperature API - 2m above ground, 10mi² resolution
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

// ============================================================================
// Export
// ============================================================================

export default DashboardPage;
