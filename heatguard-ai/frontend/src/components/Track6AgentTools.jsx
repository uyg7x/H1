import { useState } from 'react'
import { Bot, Terminal, Play, Send, Cpu, Activity, CheckCircle, AlertTriangle, Info, Zap, Shield, TrendingUp } from 'lucide-react'
import apiService from '../services/mockApi'

function ThermometerIcon(props) { return <Thermometer {...props} /> }
function RouteIcon(props) { return <TrendingUp {...props} /> }
function AlertIcon(props) { return <AlertTriangle {...props} /> }

const AGENTS = [
  { id: 'HeatRiskBot', name: 'HeatRiskBot', icon: ThermometerIcon, desc: 'Analyze heat risk for any location', color: '#ef4444' },
  { id: 'RouteOptimizer', name: 'RouteOptimizer', icon: RouteIcon, desc: 'Generate cool routes minimizing heat exposure', color: '#3b82f6' },
  { id: 'AlertDispatcher', name: 'AlertDispatcher', icon: AlertIcon, desc: 'Send heat alerts to populations', color: '#eab308' },
  { id: 'EnergyPredictor', name: 'EnergyPredictor', icon: Zap, desc: 'Forecast AC and energy load peaks', color: '#8b5cf6' },
  { id: 'PolicyAdvisor', name: 'PolicyAdvisor', icon: Shield, desc: 'Recommend cooling center activation', color: '#22c55e' },
]

function Track6AgentTools({ showToast }) {
  const [selectedAgent, setSelectedAgent] = useState('HeatRiskBot')
  const [query, setQuery] = useState('')
  const [logs, setLogs] = useState(apiService.getAgentLogs())
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState(null)

  const runAgent = async () => {
    if (!query.trim()) {
      showToast('Enter a query first', 'error')
      return
    }
    setLoading(true)
    try {
      const result = await apiService.agentTools(selectedAgent, query)
      setLastResponse(result.data)
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        agent: selectedAgent,
        action: `Processed: ${query}`,
        result: result.data.response,
        status: result.data.confidence > 0.9 ? 'success' : 'warning'
      }
      setLogs([newLog, ...logs])
      showToast(`${selectedAgent} executed successfully`, 'success')
      setQuery('')
    } catch (err) {
      showToast('Agent execution failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} color='#22c55e' />
      case 'warning': return <AlertTriangle size={14} color='#eab308' />
      default: return <Info size={14} color='#3b82f6' />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return 'agent-log-status success'
      case 'warning': return 'agent-log-status warning'
      default: return 'agent-log-status error'
    }
  }

  return (
    <div className='fade-in'>
      <div className='page-header'>
        <h1>Track 6: Agent Tools</h1>
        <p>Surface the FortyGuard Temperature API as agent tools for AI systems</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {AGENTS.map(agent => {
          const Icon = agent.icon
          const isActive = selectedAgent === agent.id
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              style={{
                background: isActive ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: `1px solid ${isActive ? agent.color : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 16,
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: `${agent.color}20`,
                color: agent.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <Icon size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{agent.desc}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Agent Console */}
        <div className='agent-console'>
          <div className='agent-console-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={18} color='var(--accent-orange)' />
              <span style={{ fontWeight: 600 }}>Agent Console</span>
            </div>
            <span className='badge badge-demo' style={{ fontSize: 10 }}>
              <Cpu size={10} style={{ marginRight: 4 }} /> {selectedAgent}
            </span>
          </div>
          <div className='agent-console-body'>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>
                Query / Command
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type='text'
                  className='route-input'
                  placeholder={`e.g., "Analyze downtown ${selectedAgent?.name || 'Phoenix'} heat risk"`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && runAgent()}
                  style={{ flex: 1 }}
                />
                <button className='route-btn' style={{ width: 'auto', padding: '10px 20px' }} onClick={runAgent} disabled={loading}>
                  {loading ? <div className='loading-spinner' style={{ width: 16, height: 16 }} /> : <Send size={16} />}
                </button>
              </div>
            </div>

            {lastResponse && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Last Response</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.5 }}>{lastResponse.response}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Confidence: {(lastResponse.confidence * 100).toFixed(1)}%</span>
                  <span>Time: {lastResponse.execution_time_ms}ms</span>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Execution Logs
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {logs.map(log => (
                <div key={log.id} className='agent-log'>
                  <div className='agent-log-icon' style={{ background: `${AGENTS.find(a => a.id === log.agent)?.color || '#3b82f6'}20`, color: AGENTS.find(a => a.id === log.agent)?.color || '#3b82f6' }}>
                    <Bot size={16} />
                  </div>
                  <div className='agent-log-content'>
                    <div className='agent-log-header'>
                      <span className='agent-log-agent'>{log.agent}</span>
                      <span className='agent-log-time'>{log.timestamp}</span>
                    </div>
                    <div className='agent-log-action'>{log.action}</div>
                    <div className='agent-log-result'>{log.result}</div>
                  </div>
                  <span className={getStatusBadge(log.status)}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API as Tools */}
        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>API as Agent Tools</div>
              <div className='chart-card-subtitle'>How to surface Temperature API endpoints as agent capabilities</div>
            </div>
          </div>
          <div className='code-block' style={{ marginBottom: 16 }}>
            <pre>{`# OpenAI Function Calling Example
{
  "name": "get_heat_intelligence",
  "description": "Get heat risk for a location",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City or address"
      },
      "resolution": {
        "type": "string",
        "enum": ["1mi²", "10mi²"]
      }
    },
    "required": ["location"]
  }
}`}</pre>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>Track 6 Challenge:</strong> Build AI agents that can autonomously:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Query hyperlocal temperature data</li>
              <li>Make heat-aware routing decisions</li>
              <li>Dispatch alerts based on risk thresholds</li>
              <li>Recommend policy actions in real-time</li>
            </ul>
            <p>All endpoints support async submit-and-poll patterns. See API Explorer for details.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Track6AgentTools