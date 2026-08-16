// ============================================================================
// HeatGuard AI - Main Dashboard Page
// 5-Tab Enterprise-Grade Dashboard for FortyGuard Global AI Hackathon '26
// ============================================================================

import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useAppContext } from '../context/AppContext';
import TabNavigation from '../components/TabNavigation';
import AreaDashboard from '../components/AreaDashboard';
import AIChat from '../components/AIChat';
import TrackAnalytics from '../components/TrackAnalytics';
import SettingsPanel from '../components/SettingsPanel';

// CRITICAL: Dynamic import for MapView to prevent SSR crashes
const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-220px)] min-h-[560px] bg-slate-950 rounded-3xl border border-white/10">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading Geospatial Command...</p>
      </div>
    </div>
  ),
});

// ============================================================================
// Dashboard Component
// ============================================================================

const DashboardPage: React.FC = () => {
  const { activeTab, temperatureData } = useAppContext();

  // Render the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapView />;
      case 'area':
        return <AreaDashboard />;
      case 'ai':
        return <AIChat />;
      case 'analytics':
        return <TrackAnalytics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <MapView />;
    }
  };

  const temp = temperatureData?.temperature_f || 112;
  const risk = temperatureData?.risk_level || 'extreme';

  const riskColor =
    temp >= 106 ? 'text-red-400' : temp >= 96 ? 'text-orange-400' : temp >= 86 ? 'text-yellow-400' : 'text-green-400';

  return (
    <>
      <Head>
        <title>HeatGuard AI — Climate Resilience Command Center</title>
        <meta name="description" content="Autonomous AI-powered heat resilience platform for cities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen text-slate-100 bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#020617_55%,#010309_100%)]">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(249,115,22,0.5)]">
                  <span className="text-white font-black text-sm">HG</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">HeatGuard AI</h1>
                  <p className="text-[11px] text-slate-400">Powered by FortyGuard Temperature API</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Team Badge */}
                <div className="hidden md:block glass-chip px-4 py-1.5 rounded-full border-purple-400/30">
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-semibold text-sm">
                    PJY → RuST BaBA
                  </span>
                </div>

                {/* Live Status */}
                <div className="glass-chip px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-300 text-xs font-semibold">Live</span>
                </div>

                {/* Current Temperature Badge */}
                <div className="glass rounded-xl px-4 py-1.5 text-center">
                  <p className={`text-2xl font-black leading-none ${riskColor}`}>{temp}°F</p>
                  <p className="text-[10px] text-slate-400 capitalize tracking-wide">{risk} · 2m AGL</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Tab Navigation */}
          <TabNavigation />

          {/* Tab Content */}
          <div className="mt-5">{renderTabContent()}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-10 py-6">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs space-y-1">
            <p>
              Built for FortyGuard Global AI Hackathon &apos;26 ·
              <span className="text-slate-600"> Track 01: Resilient Cities &amp; Infrastructure</span> ·
              <span className="text-slate-600"> Track 06: AI Agent Tools</span>
            </p>
            <p>Hyperlocal heat intelligence — 2m above ground, 10m² resolution</p>
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
