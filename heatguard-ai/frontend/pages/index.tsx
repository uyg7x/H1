// ============================================================================
// HeatGuard AI - Main Dashboard Page
// Redirect to the new 5-tab dashboard
// ============================================================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const router = useRouter();

  // Redirect to dashboard
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white">Loading HeatGuard AI Dashboard...</p>
      </div>
    </div>
  );
};

// ============================================================================
// Welcome Overlay Component
// ============================================================================

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-background-card rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-heat-extreme to-heat-high rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">HG</span>
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Welcome to HeatGuard AI
          </h1>
          
          <p className="text-text-secondary mb-4">
            Your intelligent platform for resilient cities and AI-powered emergency response.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-heat-extreme/20 text-heat-extreme rounded-lg flex items-center justify-center text-xs font-bold">
                01
              </div>
              <span className="text-text-primary">Resilient Cities & Infrastructure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                06
              </div>
              <span className="text-text-primary">AI Agent Tools</span>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setIsVisible(false)}
              className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-900 transition-all"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                window.open('https://github.com/fortyguard/heatguard-ai', '_blank');
                setIsVisible(false);
              }}
              className="flex-1 py-3 bg-background-secondary text-text-primary font-semibold rounded-xl hover:bg-background-tertiary transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default HomePage;
