import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'
import { Activity, MapPin, TrendingUp, RefreshCw, Shield, Thermometer, Settings, Sun, Moon, Wind } from 'lucide-react'
import apiService from '../services/mockApi'

function Track1ResilientCities({ selectedCity, showToast }) {
  const [cityData, setCityData] = useState(null)
  const [heatAuditData, setHeatAuditData] = useState([])
  const [digitalTwinData, setDigitalTwinData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scenario, setScenario] = useState('baseline')

  useEffect(() => {
    loadCityData()
  }, [selectedCity])

  const loadCityData = async () => {
    if (!selectedCity.id) return
    
    setLoading(true)
    try {
      const [cityInfo, heatAudit, twinData] = await Promise.all([
        apiService.getCityInfo(selectedCity.id),
        apiService.getHeatAudit(selectedCity.id),
        apiService.getDigitalTwin(selectedCity.id, scenario)
      ])
      
      setCityData(cityInfo.data)
      setHeatAuditData(heatAudit.data)
      setDigitalTwinData(twinData.data)
    } catch (err) {
      showToast('Failed to load city data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const runScenario = async (scenarioName) => {
    setScenario(scenarioName)
    setLoading(true)
    try {
      const result = await apiService.getDigitalTwin(selectedCity.id, scenarioName)
      setDigitalTwinData(result.data)
      showToast(`Scenario '${scenarioName}' executed`, 'success')
    } catch (err) {
      showToast('Scenario execution failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!cityData || loading) {
    return (
      <div className='fade-in'>
        <div className='page-header'>
          <h1>Track 1: Resilient Cities</h1>
          <p>Urban heat resilience planning for {selectedCity?.name || 'Select a city'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ marginRight: 10, opacity: 0.5 }} />
          <span>Loading city data...</span>
        </div>
      </div>
    )
  }

  const getRiskLevel = (temp) => {
    if (temp >= 105) return 'extreme'
    if (temp >= 95) return 'high'
    if (temp >= 85) return 'moderate'
    return 'low'
  }

  const riskColors = {
    extreme: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e'
  }

  return (
    <div className='fade-in'>
      <div className='page-header'>
        <h1>Track 1: Resilient Cities</h1>
        <p>Urban heat resilience planning for {cityData.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>City Overview</div>
              <div className='chart-card-subtitle'>Key metrics and resilience indicators</div>
            </div>
          </div>
          <div className='chart-card-content'>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 }}>Population</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{cityData.population.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 }}>Area</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{cityData.area_sq_mi} mi²</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 }}>Avg Summer Temp</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: riskColors[getRiskLevel(cityData.avg_summer_temp)] }}>
                  {cityData.avg_summer_temp}°F
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 }}>Heat Vulnerability Index</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{cityData.heat_vulnerability_index}/100</div>
              </div>
            </div>
          </div>
        </div>

        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>Heat Preparedness</div>
              <div className='chart-card-subtitle'>Cooling infrastructure and readiness</div>
            </div>
          </div>
          <div className='chart-card-content'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sun size={20} color='#fbbf24' />
                <span style={{ fontWeight: 600 }}>Cooling Centers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
                <span>{cityData.cooling_centers}</span>
                <span>{cityData.cooling_centers_needed} needed</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Moon size={20} color='#6366f1' />
                <span style={{ fontWeight: 600 }}>Tree Canopy Coverage</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
                <span>{cityData.tree_canopy_percent}%</span>
                <span>Target: 40%</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wind size={20} color='#10b981' />
                <span style={{ fontWeight: 600 }}>Reflective Surfaces</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
                <span>{cityData.reflective_surfaces_percent}%</span>
                <span>Target: 25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Heat Audit Table */}
        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>Heat Vulnerability Audit</div>
              <div className='chart-card-subtitle'>Block-by-block risk assessment</div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => loadCityData()} className='btn btn-sm btn-outline'>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>
          <div className='chart-card-content'>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Neighborhood</TableCell>
                    <TableCell align="right">Avg Temp</TableCell>
                    <TableCell align="right">Risk Level</TableCell>
                    <TableCell align="right">Vulnerable Pop</TableCell>
                    <TableCell align="right">Tree Coverage</TableCell>
                    <TableCell align="right">Cooling Access</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {heatAuditData.map((block, index) => (
                    <TableRow key={block.id}>
                      <TableCell>{block.neighborhood}</TableCell>
                      <TableCell align="right">{block.avg_temp_f}°F</TableCell>
                      <TableCell align="right">
                        <span style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: riskColors[getRiskLevel(block.avg_temp_f)],
                          marginRight: 6
                        }} />
                        {getRiskLevel(block.avg_temp_f).toUpperCase()}
                      </TableCell>
                      <TableCell align="right">{block.vulnerable_population}%</TableCell>
                      <TableCell align="right">{block.tree_coverage_percent}%</TableCell>
                      <TableCell align="right">{block.cooling_access_percent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Digital Twin Simulation */}
        <div className='chart-card'>
          <div className='chart-card-header'>
            <div>
              <div className='chart-card-title'>Digital Twin Simulation</div>
              <div className='chart-card-subtitle'>Scenario-based heat mitigation planning</div>
            </div>
          </div>
          <div className='chart-card-content'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>Active Scenario:</span>
                <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>{scenario}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => runScenario('baseline')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${scenario === 'baseline' ? '#22c55e' : 'var(--border-color)'}`,
                    background: scenario === 'baseline' ? '#22c55e20' : 'var(--bg-secondary)',
                    color: scenario === 'baseline' ? '#22c55e' : 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Baseline
                </button>
                <button
                  onClick={() => runScenario('greening')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${scenario === 'greening' ? '#22c55e' : 'var(--border-color)'}`,
                    background: scenario === 'greening' ? '#22c55e20' : 'var(--bg-secondary)',
                    color: scenario === 'greening' ? '#22c55e' : 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Greening
                </button>
                <button
                  onClick={() => runScenario('cooling')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${scenario === 'cooling' ? '#22c55e' : 'var(--border-color)'}`,
                    background: scenario === 'cooling' ? '#22c55e20' : 'var(--bg-secondary)',
                    color: scenario === 'cooling' ? '#22c55e' : 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Cooling
                </button>
              </div>
            </div>

            {digitalTwinData && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Temperature Reduction</div>
                  <ResponsiveContainer height={150}>
                    <BarChart data={digitalTwinData.temp_reduction}>
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reduction" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Energy Savings</div>
                  <ResponsiveContainer height={150}>
                    <LineChart data={digitalTwinData.energy_savings}>
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
                      <CartesianGrid strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='chart-card'>
        <div className='chart-card-header'>
          <div>
            <div className='chart-card-title'>Policy Recommendations</div>
            <div className='chart-card-subtitle'>Evidence-based interventions for heat resilience</div>
          </div>
        </div>
        <div className='chart-card-content'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cityData.policy_recommendations.map((rec, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: index < cityData.policy_recommendations.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <Shield size={16} color='#22c55e' />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.description}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    Impact: {rec.impact} • Timeline: {rec.timeline} • Cost: {rec.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Track1ResilientCities