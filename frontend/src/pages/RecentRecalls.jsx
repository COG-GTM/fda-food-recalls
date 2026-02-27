import { useState, useEffect, useCallback } from 'react'
import RecallBarChart from '../components/RecallBarChart'
import ChoroplethMap from '../components/ChoroplethMap'
import ClassificationFilter from '../components/ClassificationFilter'
import StatsCard from '../components/StatsCard'
import { countRecallsByState, countRecallsByFirm, filterByClass } from '../data/stateUtils'

export default function RecentRecalls() {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(false)
  const [class1, setClass1] = useState(true)
  const [class2, setClass2] = useState(true)
  const [class3, setClass3] = useState(true)
  const [normalize, setNormalize] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedState, setSelectedState] = useState(null)

  const fetchRecalls = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await fetch('https://api.fda.gov/food/enforcement.json?sort=recall_initiation_date:desc&limit=100')
      const json = await resp.json()
      setRawData(json.results || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching FDA API:', err)
      setRawData([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecalls()
  }, [fetchRecalls])

  const filtered = filterByClass(rawData, class1, class2, class3)
  const stateCounts = countRecallsByState(filtered)
  const { firmNames, firmCounts } = countRecallsByFirm(filtered)

  // Get date range from data
  const dates = rawData.map(r => r.recall_initiation_date).filter(Boolean).sort()
  const startDate = dates[0] || ''
  const endDate = dates[dates.length - 1] || ''

  // Get recalls for selected state
  const stateRecalls = selectedState ? filtered.filter(r => {
    const pattern = (r.distribution_pattern || '').replace(/,/g, '')
    const words = pattern.split(/\s+/)
    return words.some(w => w.toLowerCase() === 'nationwide') || words.includes(selectedState)
  }) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recent FDA Recalls</h1>
          <p className="text-slate-400 text-sm mt-1">Most recent 100 FDA food recalls (updated weekly)</p>
        </div>
        <button
          onClick={fetchRecalls}
          disabled={loading}
          className="px-4 py-2 bg-accent-cyan/10 text-accent-cyan rounded-lg text-sm font-medium hover:bg-accent-cyan/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Update Records'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Recalls" value={loading ? '...' : filtered.length} gradient />
        <StatsCard label="Unique Firms" value={loading ? '...' : firmNames.length} />
        <StatsCard label="Date Range" value={startDate && endDate ? `${startDate.substring(0, 7)} to ${endDate.substring(0, 7)}` : '-'} />
        <StatsCard label="Last Updated" value={lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <ClassificationFilter
            class1={class1} class2={class2} class3={class3}
            onToggle={(key) => {
              if (key === 'class1') setClass1(!class1)
              if (key === 'class2') setClass2(!class2)
              if (key === 'class3') setClass3(!class3)
            }}
            normalize={normalize}
            onNormalize={() => setNormalize(!normalize)}
          />
          <RecallBarChart firmNames={firmNames} firmCounts={firmCounts} />
        </div>

        {/* Map + state details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Recalls by State {normalize && '(per 1,000,000 people)'}
            </h3>
            {loading ? (
              <div className="h-[500px] flex items-center justify-center text-slate-400">Loading...</div>
            ) : (
              <ChoroplethMap
                recallCounts={stateCounts}
                normalize={normalize}
                onStateClick={(state) => setSelectedState(state === selectedState ? null : state)}
              />
            )}
          </div>

          {/* State detail panel */}
          {selectedState && stateRecalls.length > 0 && (
            <div className="bg-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  Recalls affecting {selectedState} ({stateRecalls.length})
                </h3>
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {stateRecalls.map((recall, i) => (
                  <div key={i} className="bg-navy rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-accent-cyan text-sm font-medium">{recall.recalling_firm}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        recall.classification === 'Class I' ? 'bg-accent-red/20 text-accent-red' :
                        recall.classification === 'Class II' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-accent-green/20 text-accent-green'
                      }`}>
                        {recall.classification}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{recall.product_description}</p>
                    <p className="text-slate-500 text-xs mt-1">{recall.reason_for_recall}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
