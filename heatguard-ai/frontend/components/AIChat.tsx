// ==========================================================================
// HeatGuard AI - AI Command Center (Tab 3)
// Production-grade AI chat interface for FortyGuard Global AI Hackathon '26
// ==========================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { RISK_COLORS, quickActions } from '../lib/mockData';
import { ChatMessage, RiskLevel } from '../lib/types';
import Badge, { RiskBadge, StatusBadge } from './ui/Badge';
import ProgressBar, { CircularProgress } from './ui/ProgressBar';

// ==========================================================================
// AI Chat Component
// ==========================================================================

const AIChat: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    temperatureData,
    routeMode,
    setRouteMode,
    handleAIAction,
    analytics,
    emergencyAlerts
  } = useAppContext();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Generate unique ID for messages
  const generateId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInputValue('');
    setIsLoading(true);
    setShowQuickActions(false);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate AI response based on user input
    const aiResponse = generateAIResponse(inputValue.trim());
    
    addChatMessage(aiResponse);
    setIsLoading(false);

    // Handle AI actions
    handleAIActionFromMessage(inputValue.trim());
  }, [inputValue, isLoading, addChatMessage, handleAIAction]);

  // Generate AI response based on user input
  const generateAIResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase();
    let response = '';
    let metadata: ChatMessage['metadata'] = {};

    // Temperature queries
    if (lowerInput.includes('temperature') || lowerInput.includes('temp') || lowerInput.includes('how hot')) {
      response = `Current temperature in ${temperatureData?.location || 'Phoenix, AZ'} is ${temperatureData?.temperature_f.toFixed(1) || '112.5'}°F with ${temperatureData?.risk_level || 'Extreme'} risk level. Measured 2m above ground at 10mi² resolution.`;
      metadata = {
        temperature: temperatureData?.temperature_f || 112.5,
        risk_level: temperatureData?.risk_level || 'extreme',
      };
    }
    // Route queries
    else if (lowerInput.includes('route') || lowerInput.includes('path') || lowerInput.includes('direction')) {
      if (lowerInput.includes('cool') || lowerInput.includes('safe') || lowerInput.includes('safest')) {
        response = `🧊 Coolest route activated! This path avoids extreme heat zones and takes you through shaded areas. Average temperature: 94°F, Risk Level: Moderate. Distance: 5.1km, Time: 15 minutes.`;
        metadata = { action: 'reroute', temperature: 94, risk_level: 'moderate' };
      } else if (lowerInput.includes('fast') || lowerInput.includes('quick') || lowerInput.includes('shortest')) {
        response = `⚡ Fastest route activated! This direct path gets you to your destination quickly but passes through extreme heat zones. Average temperature: 110°F, Risk Level: Extreme. Distance: 4.2km, Time: 12 minutes.`;
        metadata = { action: 'reroute', temperature: 110, risk_level: 'extreme' };
      } else {
        response = `I recommend the Coolest Route for your safety. It's slightly longer (15 min vs 12 min) but significantly safer, reducing your heat exposure by 16°F. Would you like me to switch to the coolest route?`;
      }
    }
    // Zone queries
    else if (lowerInput.includes('zone') || lowerInput.includes('area') || lowerInput.includes('district')) {
      response = `Here are the current heat zones: Downtown (112°F, Extreme), Industrial (115°F, Extreme), Residential (105°F, High), Parks (94°F, Moderate). The Industrial District is currently the most dangerous.`;
    }
    // Emergency queries
    else if (lowerInput.includes('emergency') || lowerInput.includes('alert') || lowerInput.includes('danger')) {
      response = `🚨 EMERGENCY ALERT: Extreme heat warning active for Downtown and Industrial zones (115°F+). Cooling centers are available at Phoenix Public Library, Cool Haven Community Center, and Desert Ridge Mall.`;
      metadata = { action: 'alert' };
    }
    // Cooling center queries
    else if (lowerInput.includes('cooling') || lowerInput.includes('shelter') || lowerInput.includes('safe place')) {
      response = `❄️ Nearby cooling centers: Phoenix Public Library (72°F, 9AM-8PM), Cool Haven Community Center (74°F, 8AM-9PM), Desert Ridge Mall (70°F, 10AM-10PM). All are within 0.5 miles of high-risk areas.`;
    }
    // Dog/pet queries
    else if (lowerInput.includes('dog') || lowerInput.includes('pet') || lowerInput.includes('animal')) {
      response = `🐕 PET SAFETY ALERT: Pavement temperature exceeds 110°F in current conditions. Dog paws can burn at 100°F+. I've switched you to the Coolest Route and recommend avoiding outdoor walks between 10AM-6PM.`;
      metadata = { action: 'reroute' };
    }
    // Health queries
    else if (lowerInput.includes('health') || lowerInput.includes('heatstroke') || lowerInput.includes('risk')) {
      response = `⚕️ HEALTH ADVISORY: At 112.5°F with Extreme risk, heatstroke is possible within 15-30 minutes of exposure. Symptoms include dizziness, nausea, confusion. Seek air conditioning immediately. Vulnerable populations should avoid outdoor activities.`;
    }
    // Report queries
    else if (lowerInput.includes('report') || lowerInput.includes('summary') || lowerInput.includes('data')) {
      response = `📊 HEAT RISK REPORT: Phoenix, AZ - Current: 112.5°F (Extreme). Zones: 2 Extreme, 1 High, 1 Moderate. Population at risk: ~156,000. Recommended action: Activate cooling centers, issue public advisory.`;
    }
    // Default response
    else {
      response = `I'm HeatGuard AI, your climate resilience assistant. I can help you with real-time temperature data, safe route planning, emergency alerts, and heat risk analysis. Current temperature: ${temperatureData?.temperature_f.toFixed(1) || '112.5'}°F (${temperatureData?.risk_level || 'Extreme'} risk).`;
      metadata = {
        temperature: temperatureData?.temperature_f || 112.5,
        risk_level: temperatureData?.risk_level || 'extreme',
      };
    }

    return {
      id: generateId(),
      sender: 'ai',
      content: response,
      timestamp: new Date().toISOString(),
      metadata,
    };
  };

  // Handle AI actions from user messages
  const handleAIActionFromMessage = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cool') || 
        lowerMessage.includes('safe') ||
        lowerMessage.includes('dog') ||
        lowerMessage.includes('pavement') ||
        lowerMessage.includes('hot')) {
      handleAIAction('reroute');
      setRouteMode('cool');
    }

    if (lowerMessage.includes('alert') || 
        lowerMessage.includes('emergency') ||
        lowerMessage.includes('danger')) {
      handleAIAction('alert', {
        id: generateId(),
        type: 'extreme_heat',
        severity: 'critical',
        message: 'Extreme heat alert triggered by user request',
        affected_zones: ['downtown', 'industrial'],
        timestamp: new Date().toISOString(),
        action_required: 'Activate cooling centers',
      });
    }

    if (lowerMessage.includes('map') || lowerMessage.includes('show')) {
      handleAIAction('switch-tab', 'map');
    }
  }, [handleAIAction, setRouteMode]);

  // Handle quick action
  const handleQuickAction = useCallback((command: string) => {
    setInputValue(command);
    setShowQuickActions(false);
    // Auto-send after a brief delay
    setTimeout(() => {
      if (inputValue === command) {
        handleSendMessage();
      }
    }, 100);
  }, [inputValue, handleSendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">🤖 AI Command Center</h2>
            <p className="text-text-secondary">
              Intelligent heat analysis and autonomous route optimization
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status="online" label="AI Online" />
            <div className="flex items-center space-x-2">
              <CircularProgress value={analytics.ai.user_satisfaction} size={40} />
              <span className="text-sm text-text-secondary">{analytics.ai.user_satisfaction}% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background-card border border-border-primary rounded-xl p-4 shadow-lg">
          <div className="text-sm text-text-secondary mb-1">Total Queries</div>
          <div className="text-2xl font-bold text-blue-500">{analytics.ai.total_queries.toLocaleString()}</div>
          <div className="text-xs text-green-500">+12 today</div>
        </div>
        <div className="bg-background-card border border-border-primary rounded-xl p-4 shadow-lg">
          <div className="text-sm text-text-secondary mb-1">Autonomous Reroutes</div>
          <div className="text-2xl font-bold text-green-500">{analytics.ai.autonomous_reroutes}</div>
          <div className="text-xs text-green-500">AI-optimized</div>
        </div>
        <div className="bg-background-card border border-border-primary rounded-xl p-4 shadow-lg">
          <div className="text-sm text-text-secondary mb-1">Emergency Alerts</div>
          <div className="text-2xl font-bold text-red-500">{analytics.ai.emergency_alerts}</div>
          <div className="text-xs text-red-500">{emergencyAlerts.length} active</div>
        </div>
        <div className="bg-background-card border border-border-primary rounded-xl p-4 shadow-lg">
          <div className="text-sm text-text-secondary mb-1">Avg Response Time</div>
          <div className="text-2xl font-bold text-purple-500">{analytics.ai.avg_response_time_ms}ms</div>
          <div className="text-xs text-green-500">Fast</div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-background-card border border-border-primary rounded-xl p-6 shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">HeatGuard AI Assistant</h3>
              <p className="text-xs text-text-secondary">Powered by FortyGuard Temperature API</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-background-secondary hover:bg-background-tertiary rounded-lg text-sm font-medium text-text-secondary transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Welcome to HeatGuard AI</h3>
              <p className="text-text-secondary max-w-md">
                I'm your intelligent climate resilience assistant. I can help you analyze heat risks, plan safe routes, and manage emergency responses using real-time FortyGuard temperature data.
              </p>
              <div className="mt-6">
                <p className="text-sm text-text-tertiary mb-4">Try these commands:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.slice(0, 3).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.command)}
                      className="px-3 py-1 bg-background-secondary hover:bg-background-tertiary rounded-lg text-sm font-medium text-text-primary transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatMessages.map((message) => {
              const isUser = message.sender === 'user';
              const colors = message.metadata?.risk_level ? RISK_COLORS[message.metadata.risk_level as RiskLevel] : { primary: '#3b82f6' };

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} space-x-3 max-w-[80%]`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
                    style={{
                      backgroundColor: isUser ? '#3b82f6' : '#1f2937',
                      color: isUser ? 'white' : '#e5e7eb',
                      border: message.metadata?.risk_level ? `2px solid ${colors.primary}` : 'none',
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-end mt-2 space-x-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.metadata?.risk_level && (
                        <RiskBadge riskLevel={message.metadata.risk_level as RiskLevel} showLabel={false} />
                      )}
                      {message.metadata?.temperature && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {message.metadata.temperature}°F
                        </span>
                      )}
                    </div>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">👤</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div className="bg-background-secondary rounded-2xl rounded-bl-none p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && chatMessages.length === 0 && (
          <div className="mt-4 pt-4 border-t border-border-primary">
            <p className="text-sm text-text-tertiary mb-3">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.command)}
                  className="px-3 py-2 bg-background-secondary hover:bg-background-tertiary rounded-lg text-sm font-medium text-text-primary transition-colors border border-border-primary"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="mt-4 pt-4 border-t border-border-primary">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask HeatGuard AI about heat risks, safe routes, or emergency alerts..."
              className="flex-1 bg-background-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            Type your question or use quick actions. Press Enter to send, Shift+Enter for new line.
          </p>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-3">🧠 AI Capabilities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <span className="text-blue-500">🌡️</span>
              </div>
              <div>
                <div className="font-medium text-text-primary">Temperature Analysis</div>
                <div className="text-sm text-text-secondary">Real-time heat data</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                <span className="text-green-500">🗺️</span>
              </div>
              <div>
                <div className="font-medium text-text-primary">Smart Routing</div>
                <div className="text-sm text-text-secondary">AI-optimized paths</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <span className="text-red-500">🚨</span>
              </div>
              <div>
                <div className="font-medium text-text-primary">Emergency Alerts</div>
                <div className="text-sm text-text-secondary">Automated warnings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-3">💡 Example Commands</h3>
          <div className="space-y-2">
            {[
              'What is the current temperature?',
              'Find me a safe route to the hospital',
              'Which zone is most dangerous?',
              'Show me all cooling shelters',
              'Generate a heat risk report',
              'Alert emergency services'
            ].map((command, index) => (
              <button
                key={index}
                onClick={() => setInputValue(command)}
                className="w-full text-left px-3 py-2 bg-background-secondary hover:bg-background-tertiary rounded-lg text-sm text-text-primary transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-3">📊 Current Conditions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Temperature</span>
              <TemperatureBadge 
                temperature={temperatureData?.temperature_f || 112.5} 
                riskLevel={temperatureData?.risk_level || 'extreme'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Risk Level</span>
              <RiskBadge riskLevel={temperatureData?.risk_level || 'extreme'} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Route Mode</span>
              <Badge 
                variant="solid"
                size="sm"
                style={{
                  backgroundColor: routeMode === 'cool' ? '#10B981' : '#dc2626',
                  color: 'white'
                }}
              >
                {routeMode === 'cool' ? '🧊 Cool Route' : '⚡ Fast Route'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">API Status</span>
              <StatusBadge status="online" />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <div className="bg-background-card border border-border-primary rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">🚨 Active Emergency Alerts</h3>
            <Badge variant="solid" size="sm" style={{ backgroundColor: '#dc2626', color: 'white' }}>
              {emergencyAlerts.length} Active
            </Badge>
          </div>
          <div className="space-y-3">
            {emergencyAlerts.map((alert) => {
              const colors = alert.severity === 'critical' ? RISK_COLORS.extreme : 
                            alert.severity === 'high' ? RISK_COLORS.high : 
                            alert.severity === 'medium' ? RISK_COLORS.moderate : 
                            RISK_COLORS.low;
              
              return (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border-l-4"
                  style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}10` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🚨</span>
                      <span className="font-bold text-text-primary">{alert.type.replace('_', ' ')}</span>
                    </div>
                    <Badge 
                      variant="solid" 
                      size="sm"
                      style={{ backgroundColor: colors.primary, color: 'white' }}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{alert.message}</p>
                  <div className="text-xs text-text-tertiary">
                    Affected: {alert.affected_zones.join(', ')} | {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-500 mt-1">
                    Action: {alert.action_required}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// Export
// ==========================================================================

export default AIChat;