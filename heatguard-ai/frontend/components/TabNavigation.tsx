// ==========================================================================
// HeatGuard AI - Tab Navigation Component
// Production-grade tab navigation for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RISK_COLORS } from '../lib/mockData';

// ==========================================================================
// Tab Navigation Props
// ==========================================================================

interface TabNavigationProps {
  className?: string;
}

// ==========================================================================
// Tab Item Component
// ==========================================================================

interface TabItemProps {
  id: 'map' | 'area' | 'ai' | 'analytics' | 'settings';
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  isActive: boolean;
  onClick: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  id,
  label,
  icon,
  badge,
  isActive,
  onClick,
}) => {
  // Get color based on tab ID
  const getTabColor = () => {
    switch (id) {
      case 'map': return RISK_COLORS.extreme.primary;
      case 'area': return RISK_COLORS.high.primary;
      case 'ai': return '#3b82f6';
      case 'analytics': return RISK_COLORS.moderate.primary;
      case 'settings': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const color = getTabColor();

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'text-white shadow-lg'
          : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
      }`}
      style={{
        background: isActive ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` : '',
      }}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

// ==========================================================================
// Main Tab Navigation Component
// ==========================================================================

const TabNavigation: React.FC<TabNavigationProps> = ({ className = '' }) => {
  const { activeTab, setActiveTab, emergencyAlerts, chatMessages } = useAppContext();

  const tabs = [
    {
      id: 'map' as const,
      label: 'Geospatial Command',
      icon: '🗺️',
      badge: emergencyAlerts.length > 0 ? emergencyAlerts.length : undefined,
    },
    {
      id: 'area' as const,
      label: 'Area Intelligence',
      icon: '📊',
    },
    {
      id: 'ai' as const,
      label: 'AI Autopilot',
      icon: '🤖',
      badge: chatMessages.length > 0 ? chatMessages.length : undefined,
    },
    {
      id: 'analytics' as const,
      label: 'Temporal Analytics',
      icon: '📈',
    },
    {
      id: 'settings' as const,
      label: 'System Telemetry',
      icon: '⚙️',
    },
  ];

  return (
    <nav className={`bg-background-card border border-border-primary rounded-2xl p-2 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              badge={tab.badge}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

// ==========================================================================
// Vertical Tab Navigation (for sidebar)
// ==========================================================================

interface VerticalTabNavigationProps {
  className?: string;
}

const VerticalTabNavigation: React.FC<VerticalTabNavigationProps> = ({ className = '' }) => {
  const { activeTab, setActiveTab, emergencyAlerts, chatMessages } = useAppContext();

  const tabs = [
    {
      id: 'map' as const,
      label: 'Live Map & Routing',
      icon: '🗺️',
      badge: emergencyAlerts.length > 0 ? emergencyAlerts.length : undefined,
    },
    {
      id: 'area' as const,
      label: 'Area Intelligence',
      icon: '📊',
    },
    {
      id: 'ai' as const,
      label: 'AI Command Center',
      icon: '🤖',
      badge: chatMessages.length > 0 ? chatMessages.length : undefined,
    },
    {
      id: 'analytics' as const,
      label: 'Track Analytics',
      icon: '📈',
    },
    {
      id: 'settings' as const,
      label: 'Settings & API',
      icon: '⚙️',
    },
  ];

  return (
    <nav className={`space-y-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? 
          (tab.id === 'map' ? RISK_COLORS.extreme.primary :
           tab.id === 'area' ? RISK_COLORS.high.primary :
           tab.id === 'ai' ? '#3b82f6' :
           tab.id === 'analytics' ? RISK_COLORS.moderate.primary :
           '#6b7280') : '#6b7280';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-gradient-to-r shadow-lg' 
                : 'bg-background-card text-text-secondary hover:bg-background-tertiary'
            }`}
            style={{
              background: isActive ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` : '',
              color: isActive ? 'white' : '',
            }}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="flex-1 text-left font-medium">{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

// ==========================================================================
// Quick Tab Switcher (for mobile)
// ==========================================================================

interface QuickTabSwitcherProps {
  className?: string;
}

const QuickTabSwitcher: React.FC<QuickTabSwitcherProps> = ({ className = '' }) => {
  const { activeTab, setActiveTab } = useAppContext();

  const tabs = [
    { id: 'map' as const, icon: '🗺️', label: 'Map' },
    { id: 'area' as const, icon: '📊', label: 'Area' },
    { id: 'ai' as const, icon: '🤖', label: 'AI' },
    { id: 'analytics' as const, icon: '📈', label: 'Analytics' },
    { id: 'settings' as const, icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className={`flex justify-around items-center ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
              isActive 
                ? 'bg-gradient-to-t from-orange-600 to-red-600 text-white' 
                : 'text-text-secondary hover:bg-background-secondary'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ==========================================================================
// Export
// ==========================================================================

export default TabNavigation;
export { TabItem, VerticalTabNavigation, QuickTabSwitcher };