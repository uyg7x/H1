import { useState } from 'react'
import { Code, Play, Copy, CheckCircle, Terminal } from 'lucide-react'
import apiService from '../services/mockApi'

function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const endpoints = apiService.getApiEndpoints()

  const testEndpoint = async (endpoint) => {
    setSelectedEndpoint(endpoint)
    setLoading(true)
    try {
      let result
      switch (endpoint.endpoint) {
        case '/v1/heat-intelligence':
          result = endpoint.method === 'GET' 
            ? await apiService.getHeatIntelligence('Phoenix, AZ')
            : await apiService.postHeatIntelligence({ location: 'Phoenix, AZ', risk_level: 'extreme' })
          break
        case '/v1/snapshot':
          result = await apiService.getSnapshot(33.4484, -112.0740, 5)
          break
        case '/v1/exceedance':
          result = await apiService.getExceedance('Phoenix, AZ', 100, 7)
          break
        case '/v1/persistence':
          result = await apiService.getPersistence('Phoenix, AZ', 24)
          break
        case '/v1/route-analysis':
          result = await apiService.analyzeRoute(['Central Station', 'Green Park', 'Riverside Walk'])
          break
        case '/v1/agent-tools':
          result = await apiService.agentTools('HeatRiskBot', 'Analyze Phoenix downtown')
          break
        default:
          result = { data: { message: 'Not implemented in demo' } }
      }
      setResponse(result)
    } catch (err) {
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
  }

  return (
    <div className='fade-in'>
      <div className='page-header'>
        <h1>API Explorer</h1>
        <p>Test FortyGuard Temperature API endpoints — Demo mode active (no key required)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className='api-explorer'>
          {endpoints.map((ep, i) => (
            <div key={i} className='api-endpoint' onClick={() => testEndpoint(ep)}>
              <div className='api-endpoint-header'>
                <span className={`api-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                <span className='api-endpoint-path'>{ep.endpoint}</span>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer' }}>
                  <Play size={14} />
                </button>
              </div>
              <div className='api-endpoint-desc'>{ep.description}</div>
              <div style={{ paddingLeft: 52, marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ep.params.map((param, j) => (
                  <span key={j} style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                    {param}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>Response</div>
              <div className='chart-card-subtitle'>
                {selectedEndpoint ? `${selectedEndpoint.method} ${selectedEndpoint.endpoint}` : 'Select an endpoint to test'}
              </div>
            </div>
            {response && (
              <button onClick={() => copyToClipboard(response)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Copy size={16} />
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div className='loading-spinner' style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : response ? (
            <div className='code-block' style={{ height: 400, overflow: 'auto' }}>
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
              <Terminal size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>Click an endpoint to see the response</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiExplorer