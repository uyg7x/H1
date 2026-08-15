// ============================================================================
// Main Layout Component
// ============================================================================

import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import Sidebar from './Sidebar';
import AIChatWidget from './chat/AIChatWidget';
import EmergencyAlertBar from './alerts/EmergencyAlertBar';
import { THEME } from '@/lib/constants';

// Initialize font
const inter = Inter({ subsets: ['latin'] });

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'HeatGuard AI - Resilient Cities & AI Agent Tools',
  description = 'Interactive heat map and AI-powered emergency response platform for city planners and responders',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Custom CSS for Leaflet */}
        <style jsx global>{`
          .leaflet-container {
            background-color: ${THEME.DARK.background.secondary};
          }
          
          .leaflet-popup-content {
            background-color: ${THEME.DARK.background.card};
            color: ${THEME.DARK.text.primary};
          }
          
          .leaflet-popup-content h4 {
            color: ${THEME.DARK.text.primary};
            margin-bottom: 8px;
          }
          
          .leaflet-popup-content p {
            color: ${THEME.DARK.text.secondary};
            margin: 4px 0;
          }
          
          .leaflet-control-layers {
            background-color: ${THEME.DARK.background.card};
            color: ${THEME.DARK.text.primary};
          }
          
          .leaflet-control-layers label {
            color: ${THEME.DARK.text.secondary};
          }
          
          .heat-zone-tooltip {
            background-color: ${THEME.DARK.background.card};
            color: ${THEME.DARK.text.primary};
            border: 1px solid ${THEME.DARK.border.primary};
            padding: 8px 12px;
            border-radius: 4px;
          }
          
          .custom-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 16px;
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .route-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
          }
          
          .route-marker.start {
            background-color: #10b981;
          }
          
          .route-marker.end {
            background-color: #dc2626;
          }
        `}</style>
      </Head>
      
      <QueryClientProvider client={queryClient}>
        <div className={`${inter.className} min-h-screen ${theme}`}>
          {/* Emergency Alert Bar - Top of screen */}
          <EmergencyAlertBar />
          
          <div className="flex h-screen">
            {/* Sidebar - Left */}
            <Sidebar 
              isOpen={isSidebarOpen} 
              onToggle={toggleSidebar} 
              onThemeToggle={toggleTheme}
            />
            
            {/* Main Content Area */}
            <main 
              className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
                isSidebarOpen ? 'ml-0 md:ml-[320px]' : 'ml-0'
              }`}
            >
              {/* Header */}
              <header className="bg-background-secondary border-b border-border-primary px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleSidebar}
                      className="md:hidden p-2 rounded-md hover:bg-background-tertiary transition-colors"
                    >
                      <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                      </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-heat-extreme to-heat-high rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HG</span>
                      </div>
                      <h1 className="text-xl font-bold text-text-primary hidden sm:block">HeatGuard AI</h1>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="px-3 py-1 bg-heat-extreme/20 text-heat-extreme text-xs font-semibold rounded-full">
                        Track 01 + Track 06
                      </span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-md hover:bg-background-tertiary transition-colors"
                      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </header>
              
              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {children}
              </div>
            </main>
          </div>
          
          {/* AI Chat Widget - Floating */}
          <AIChatWidget />
        </div>
      </QueryClientProvider>
    </>
  );
};

export default Layout;
