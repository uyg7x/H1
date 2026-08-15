// ============================================================================
// AI Chat Widget Component
// Floating chat widget for interacting with the AI Agent (Track 06)
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAgentQueryMutation, useAgentAnalyzeMutation } from '@/hooks/useApi';
import { ChatMessage, AgentResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { RISK_COLORS } from '@/lib/constants';

interface AIChatWidgetProps {
  initialOpen?: boolean;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // API mutations
  const { mutate: queryAgent } = useAgentQueryMutation();
  const { mutate: analyzeWithAgent } = useAgentAnalyzeMutation();
  
  // Predefined quick queries
  const quickQueries = [
    "Find all hospitals in extreme heat zones",
    "What is the safest route from downtown to the nearest cooling center?",
    "Analyze the temperature data for Phoenix",
    "List all emergency locations with low risk",
    "Are there cooling centers open near me?",
    "What should I do if risk level is extreme?",
  ];
  
  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        content: "Hello! I'm HeatGuard AI, your autonomous heat analysis assistant. I can help you analyze temperature data, find emergency locations, and recommend safe routes. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          action: 'query',
          confidence: 1.0,
        },
      };
      setMessages([welcomeMessage]);
    }
  }, []);
  
  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);
  
  // Toggle chat widget
  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);
  
  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Determine if this is a location-specific query
      const locationMatch = inputValue.match(/(Phoenix|Las Vegas|Los Angeles|Houston|Miami|New York|Chicago|Atlanta)/i);
      const location = locationMatch ? locationMatch[0] : 'Phoenix, AZ';
      
      // Use the agent query mutation
      queryAgent(
        {
          query: inputValue.trim(),
          location,
        },
        {
          onSuccess: (response: AgentResponse) => {
            const aiMessage: ChatMessage = {
              id: uuidv4(),
              content: response.detailed_response,
              sender: 'ai',
              timestamp: new Date(),
              metadata: {
                action: response.action,
                confidence: response.confidence,
                data: response.data,
              },
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
          },
          onError: (error) => {
            const errorMessage: ChatMessage = {
              id: uuidv4(),
              content: "I encountered an error processing your request. Please try again.",
              sender: 'ai',
              timestamp: new Date(),
              metadata: {
                action: 'query',
                confidence: 0.5,
              },
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          action: 'query',
          confidence: 0.5,
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  }, [inputValue, isLoading, queryAgent]);
  
  // Handle quick query selection
  const handleQuickQuery = useCallback((query: string) => {
    setInputValue(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, [handleSendMessage]);
  
  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        content: "Hello! I'm HeatGuard AI, your autonomous heat analysis assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          action: 'query',
          confidence: 1.0,
        },
      };
      setMessages([welcomeMessage]);
    }, 100);
  }, []);
  
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Chat with HeatGuard AI"
      >
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[90vw] bg-background-card border border-border-primary rounded-xl shadow-xl overflow-hidden flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary bg-background-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">HG</span>
          </div>
          <div>
            <div className="font-semibold text-text-primary">HeatGuard AI</div>
            <div className="text-xs text-text-tertiary">Powered by Track 06</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-md hover:bg-background-tertiary transition-colors text-text-secondary"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={toggleMinimize}
            className="p-2 rounded-md hover:bg-background-tertiary transition-colors text-text-secondary"
            title="Minimize"
          >
            <svg className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={toggleChat}
            className="p-2 rounded-md hover:bg-heat-extreme/10 hover:text-heat-extreme transition-colors text-text-secondary"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div 
        className={`flex-1 overflow-y-auto p-4 ${isMinimized ? 'hidden' : ''}`}
      >
        {messages.length === 0 ? (
          <div className="text-center text-text-tertiary py-8">
            <div className="text-4xl mb-2">🤖</div>
            <div>Start a conversation with HeatGuard AI</div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-background-secondary text-text-primary border border-border-primary'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="flex items-center justify-end mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'ai' && message.metadata?.confidence && (
                      <span className="ml-2 text-xs">
                        Confidence: {(message.metadata.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background-secondary border border-border-primary rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Quick Queries - Shown when no messages or at start */}
      {messages.length <= 1 && !isLoading && !isMinimized && (
        <div className="p-4 border-t border-border-primary bg-background-secondary">
          <div className="text-xs text-text-tertiary mb-2">Quick queries:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickQueries.slice(0, 4).map((query) => (
              <button
                key={query}
                onClick={() => handleQuickQuery(query)}
                className="text-xs text-text-secondary hover:bg-background-tertiary p-2 rounded-lg text-left transition-colors truncate"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className={`p-3 border-t border-border-primary bg-background-secondary ${isMinimized ? 'hidden' : ''}`}>
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask HeatGuard AI..."
            disabled={isLoading}
            className="flex-1 bg-background-card border border-border-primary rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-primary-900 transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="text-right text-xs text-text-tertiary mt-1">
          {inputValue.length}/500
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default AIChatWidget;
