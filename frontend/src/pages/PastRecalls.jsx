import { useState, useEffect, useCallback } from 'react'
import RecallBarChart from '../components/RecallBarChart'
import ChoroplethMap from '../components/ChoroplethMap'
import ClassificationFilter from '../components/ClassificationFilter'
import StatsCard from '../components/StatsCard'
import { countRecallsByState, countRecallsByFirm, filterByClass } from '../data/stateUtils'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatSliderDate(val) {
  const year = 2012 + Math.floor(val / 12)
  const month = val % 12
  return `${MONTHS[month]} ${year}`
}

function toApiDate(val) {
  const year = 2012 + Math.floor(val / 12)
  const month = String((val % 12) + 1).padStart(2, '0')
  return `${year}-${month}`
}

export default function PastRecalls() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [class1, setClass1] = useState(true)
  const [class2, setClass2] = useState(true)
  const [class3, setClass3] = useState(true)
  const [normalize, setNormalize] = useState(false)
  const [startVal, setStartVal] = useState(0)    // Jan 2012
  const [endVal, setEndVal] = useState(95)        // Dec 2019

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = toApiDate(startVal)
      const endDate = toApiDate(endVal)
      const resp = await fetch(`/data/${class1}/${class2}/${class3}/${startDate}/${endDate}`)
      const json = await resp.json()
      setData(Array.isArray(json) ? json : [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setData([])
    }
    setLoading(false)
  }, [startVal, endVal, class1, class2, class3])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = filterByClass(data, class1, class2, class3)
  const stateCounts = countRecallsByState(filtered)
  const { firmNames, firmCounts } = countRecallsByFirm(filtered)
  const totalRecalls = filtered.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Past FDA Recalls</h1>
        <p className="text-slate-400 text-sm mt-1">Explore historical FDA food recalls from 2012-2019</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Recalls" value={loading ? '...' : totalRecalls.toLocaleString()} gradient />
        <StatsCard label="Unique Firms" value={loading ? '...' : firmNames.length} />
        <StatsCard label="Date Range" value={`${formatSliderDate(startVal).split(' ')[1]}-${formatSliderDate(endVal).split(' ')[1]}`} />
        <StatsCard label="Classifications" value={[class1 && 'I', class2 && 'II', class3 && 'III'].filter(Boolean).join(', ') || 'None'} />
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

          {/* Date range slider */}
          <div className="bg-card rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Date Range</h3>
            <div>
              <label className="text-slate-400 text-xs">Start: {formatSliderDate(startVal)}</label>
              <input
                type="range" min="0" max="95" value={startVal}
                onChange={e => setStartVal(Math.min(Number(e.target.value), endVal - 1))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs">End: {formatSliderDate(endVal)}</label>
              <input
                type="range" min="0" max="95" value={endVal}
                onChange={e => setEndVal(Math.max(Number(e.target.value), startVal + 1))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
            </div>
          </div>

          <RecallBarChart firmNames={firmNames} firmCounts={firmCounts} />
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Recalls by State {normalize && '(per 1,000,000 people)'}
            </h3>
            {loading ? (
              <div style={{ height: '500px' }} className="flex items-center justify-center text-slate-400">Loading map data...</div>
            ) : (
              <ChoroplethMap recallCounts={stateCounts} normalize={normalize} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
