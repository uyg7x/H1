// ============================================================================
// Next.js Custom App Component
// ============================================================================

import React from 'react';
import { AppProps } from 'next/app';
import { AppProvider } from '@/context/AppContext';
import '@/styles/globals.css';

// Leaflet CSS is loaded via CDN in _document.tsx to avoid SSR issues

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
};

export default MyApp;
