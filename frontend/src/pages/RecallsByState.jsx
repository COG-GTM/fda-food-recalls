import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { countRecallsByState, STATE_NAMES } from '../data/stateUtils'

const YEARS = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019]
const LINE_COLORS = ['#22D3EE', '#60A5FA', '#818CF8', '#A78BFA', '#F87171', '#4ADE80', '#FBBF24', '#FB923C', '#E879F9', '#34D399']

export default function RecallsByState() {
  const [yearData, setYearData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedStates, setSelectedStates] = useState(['National Average'])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchAllYears() {
      setLoading(true)
      const results = {}
      try {
        const promises = YEARS.map(year =>
          fetch(`/data/${year}-01/${year}-12`).then(r => r.json())
        )
        const allData = await Promise.all(promises)
        YEARS.forEach((year, i) => {
          const data = Array.isArray(allData[i]) ? allData[i] : []
          results[year] = countRecallsByState(data)
        })
      } catch (err) {
        console.error('Error fetching year data:', err)
      }
      setYearData(results)
      setLoading(false)
    }
    fetchAllYears()
  }, [])

  // Build chart data
  const chartData = YEARS.map(year => {
    const entry = { year: String(year) }
    const yearCounts = yearData[year] || {}

    // National average
    const values = Object.values(yearCounts)
    entry['National Average'] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0

    // Individual states
    STATE_NAMES.forEach(state => {
      entry[state] = yearCounts[state] || 0
    })

    return entry
  })

  const toggleState = (state) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    )
  }

  const filteredStates = STATE_NAMES.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value} recalls
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Recalls by State Over Time</h1>
        <p className="text-slate-400 text-sm mt-1">FDA food recall trends from 2012-2019 by state</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* State selector sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Select States</h3>
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-navy rounded-lg border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
            />

            {/* National Average always shown */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStates.includes('National Average')}
                onChange={() => toggleState('National Average')}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-cyan focus:ring-accent-cyan/50"
              />
              <span className="text-accent-cyan text-sm font-medium">National Average</span>
            </label>

            <div className="max-h-[500px] overflow-y-auto space-y-1">
              {filteredStates.map(state => (
                <label key={state} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => toggleState(state)}
                    className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700 text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-slate-300 text-sm hover:text-white transition-colors">{state}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => setSelectedStates(['National Average'])}
                className="text-xs text-slate-400 hover:text-accent-cyan transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setSelectedStates(['National Average', ...STATE_NAMES])}
                className="text-xs text-slate-400 hover:text-accent-cyan transition-colors"
              >
                Select All
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Recall Trends ({selectedStates.length} selected)
            </h3>
            {loading ? (
              <div className="h-[600px] flex items-center justify-center text-slate-400">Loading chart data...</div>
            ) : (
              <ResponsiveContainer width="100%" height={600}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: '#CBD5E1', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} />
                  <YAxis tick={{ fill: '#CBD5E1', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} label={{ value: 'Number of Recalls', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#CBD5E1', fontSize: 12 }} />
                  {selectedStates.map((state, i) => (
                    <Line
                      key={state}
                      type="monotone"
                      dataKey={state}
                      stroke={state === 'National Average' ? '#22D3EE' : LINE_COLORS[((i - 1) % LINE_COLORS.length + LINE_COLORS.length) % LINE_COLORS.length]}
                      strokeWidth={state === 'National Average' ? 3 : 2}
                      dot={{ r: state === 'National Average' ? 5 : 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
