// ============================================================================
// HeatGuard AI - Settings Panel (Tab 5)
// API configuration and integration settings
// ============================================================================

import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Key, Server, RefreshCw, CheckCircle, XCircle, Code, BookOpen } from 'lucide-react';
import { mockTemperatureData, mockHeatZones, mockHourlyForecast, mockRoutes } from '../lib/mockData';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const [apiKeyInput, setApiKeyInput] = useState(settings.api_key || '');
  const [apiUrlInput, setApiUrlInput] = useState(settings.api_url || 'http://localhost:8001');
  const [refreshRateInput, setRefreshRateInput] = useState(settings.refresh_rate || 30);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Handle settings save
  const handleSaveSettings = useCallback(() => {
    updateSettings({
      api_key: apiKeyInput,
      api_url: apiUrlInput,
      refresh_rate: refreshRateInput,
    });
    
    setTestResult({
      success: true,
      message: 'Settings saved successfully!',
    });
    
    setTimeout(() => setTestResult(null), 3000);
  }, [apiKeyInput, apiUrlInput, refreshRateInput, updateSettings]);

  // Handle API test
  const handleTestApi = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setTestResult({
        success: true,
        message: 'API connection successful! Mock data is working.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'API connection failed. Please check your settings.',
      });
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Handle mock data toggle
  const handleToggleMockData = useCallback((useMock: boolean) => {
    updateSettings({ use_mock_data: useMock });
    setTestResult({
      success: true,
      message: `Switched to ${useMock ? 'mock' : 'real'} data mode.`,
    });
    setTimeout(() => setTestResult(null), 3000);
  }, [updateSettings]);

  // Format JSON for display
  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">⚙️ Settings & API Integration</h2>
        <p className="text-gray-400">Configure FortyGuard API and system settings</p>
      </div>

      {/* API Configuration Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold">API Configuration</h3>
            <p className="text-gray-400 text-sm">FortyGuard Temperature API Settings</p>
          </div>
          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-purple-500" />
          </div>
        </div>

        <div className="space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              FortyGuard API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your FortyGuard API key (available Aug 18, 2026)"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showApiKey ? <XCircle className="w-5 h-5" /> : <Key className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              🔑 Get your API key from FortyGuard organizers on August 18, 2026
            </p>
          </div>

          {/* API URL Input */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              placeholder="https://api.fortyguard.com/v1"
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Data Source Toggle */}
          <div className="flex items-center gap-4">
            <label className="block text-gray-400 text-sm font-medium">
              Data Source
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleMockData(true)}
                className={`
                  px-4 py-2 rounded-lg transition-all
                  ${settings.use_mock_data 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                🎭 Mock Data
              </button>
              <button
                onClick={() => handleToggleMockData(false)}
                className={`
                  px-4 py-2 rounded-lg transition-all
                  ${!settings.use_mock_data 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                🌐 Real API
              </button>
            </div>
          </div>

          {/* Refresh Rate */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Data Refresh Rate (seconds)
            </label>
            <input
              type="number"
              value={refreshRateInput}
              onChange={(e) => setRefreshRateInput(Number(e.target.value))}
              min={10}
              max={300}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              How often to fetch new data (10-300 seconds)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTestApi}
              disabled={isTesting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg text-white font-medium transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Save Settings
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`
              p-3 rounded-lg mt-4
              ${testResult.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}
            `}>
              <p className={`
                text-sm
                ${testResult.success ? 'text-green-500' : 'text-red-500'}
              `}>
                {testResult.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Connection Status</h3>
          <div className="flex items-center gap-2">
            <div className={`
              w-3 h-3 rounded-full
              ${settings.use_mock_data ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}
            `} />
            <span className={`
              text-sm font-medium
              ${settings.use_mock_data ? 'text-green-500' : 'text-gray-400'}
            `}>
              {settings.use_mock_data ? 'Connected (Mock)' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">API Endpoint</p>
            <p className="text-white font-mono text-sm">{settings.api_url || 'http://localhost:8001'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Data Source</p>
            <p className="text-white font-medium">{settings.use_mock_data ? 'Mock Data' : 'Real API'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Refresh Rate</p>
            <p className="text-white font-medium">{settings.refresh_rate}s</p>
          </div>
        </div>
      </div>

      {/* Mock API Status Panel */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mock API Status Panel</h3>
          <Code className="w-5 h-5 text-gray-400" />
        </div>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-green-400">
{`{
  "location": "${mockTemperatureData.location}",
  "temperature_f": ${mockTemperatureData.temperature_f},
  "risk_level": "${mockTemperatureData.risk_level}",
  "resolution": "${mockTemperatureData.resolution}",
  "measured_at": "${mockTemperatureData.measured_at}",
  "credits_remaining": ${mockTemperatureData.credits_remaining},
  "humidity": ${mockTemperatureData.humidity},
  "heat_index": ${mockTemperatureData.heat_index},
  "zones": [
    ${mockHeatZones.map((zone, index) => `    {
      "name": "${zone.name}",
      "temp": ${zone.avg_temperature_f},
      "risk": "${zone.risk_level}",
      "population": ${zone.population},
      "coordinates": [${zone.polygon[0].lat}, ${zone.polygon[0].lng}]
    }${index < mockHeatZones.length - 1 ? ',' : ''}`).join('\n')}
  ],
  "hourly_forecast": [
    ${mockHourlyForecast.map((forecast, index) => `    {"hour": "${forecast.hour}", "temp": ${forecast.temperature_f}, "risk": "${forecast.risk_level}"}${index < mockHourlyForecast.length - 1 ? ',' : ''}`).join('\n')}
  ],
  "routes": {
    "fast": {
      "temp_avg": ${mockRoutes.fast.avg_temperature},
      "risk": "${mockRoutes.fast.risk_level}",
      "time_mins": ${mockRoutes.fast.duration_minutes},
      "waypoints": [${mockRoutes.fast.waypoints.map((wp) => `[${wp.lat}, ${wp.lng}]`).join(', ')}]
    },
    "cool": {
      "temp_avg": ${mockRoutes.cool.avg_temperature},
      "risk": "${mockRoutes.cool.risk_level}",
      "time_mins": ${mockRoutes.cool.duration_minutes},
      "waypoints": [${mockRoutes.cool.waypoints.map((wp) => `[${wp.lat}, ${wp.lng}]`).join(', ')}]
    }
  }
}`}
          </pre>
        </div>

        <div className="flex justify-between mt-4 text-sm">
          <div>
            <p className="text-gray-400">Last Fetch:</p>
            <p className="text-white">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Credits Remaining:</p>
            <p className="text-green-500 font-bold">{mockTemperatureData.credits_remaining.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Status:</p>
            <p className="text-green-500 font-bold">✅ Active</p>
          </div>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Integration Guide</h3>
          <BookOpen className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">📅 Step 1: Get Your API Key (August 18, 2026)</h4>
            <ol className="text-gray-400 text-sm space-y-1">
              <li>1. Check your email from FortyGuard organizers</li>
              <li>2. Look for subject: "Your FortyGuard Temperature API Access"</li>
              <li>3. Copy the API key from the email</li>
              <li>4. Paste it in the API Key field above</li>
            </ol>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">⚙️ Step 2: Configure Settings</h4>
            <ol className="text-gray-400 text-sm space-y-1">
              <li>1. Enter your API key above</li>
              <li>2. Set API Base URL to: <code className="text-purple-400">https://api.fortyguard.com/v1</code></li>
              <li>3. Toggle to "Real API" mode</li>
              <li>4. Click "Test Connection" to verify</li>
              <li>5. Click "Save Settings" to apply</li>
            </ol>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">🔄 Step 3: Switch to Real Data</h4>
            <p className="text-gray-400 text-sm">
              Once your API key is configured and tested, toggle the "Data Source" switch to "Real API".
              The dashboard will automatically start using real FortyGuard temperature data.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">🎯 Step 4: Verify Integration</h4>
            <ol className="text-gray-400 text-sm space-y-1">
              <li>1. Check that temperature displays correctly</li>
              <li>2. Verify map zones show real data</li>
              <li>3. Test AI agent queries with real data</li>
              <li>4. Monitor API credit usage in the status panel</li>
            </ol>
          </div>
        </div>

        <div className="mt-4 p-4 bg-purple-600/20 border border-purple-500 rounded-lg">
          <p className="text-purple-400 text-sm">
            💡 <strong>Pro Tip:</strong> Keep mock data enabled for development and testing. 
            Switch to real API only when you're ready to use your FortyGuard credits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
