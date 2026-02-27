import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '../components/StatsCard'

const PIE_COLORS = ['#22D3EE', '#60A5FA', '#818CF8', '#A78BFA', '#F87171', '#4ADE80', '#FBBF24', '#FB923C']

export default function CPSCRecalls() {
  const [recalls, setRecalls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 20

  const fetchRecalls = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/cpsc/recalls')
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      setRecalls(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching CPSC recalls:', err)
      setError('Failed to fetch CPSC recall data. Please try again.')
      setRecalls([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecalls()
  }, [fetchRecalls])

  // Extract product types for filtering
  const productTypes = [...new Set(
    recalls.flatMap(r => (r.Products || []).map(p => p.Type || 'Unknown'))
  )].sort()

  // Filter recalls
  const filtered = recalls.filter(r => {
    const matchesSearch = searchTerm === '' ||
      (r.Title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.Description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.Products || []).some(p => (p.Name || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedType === 'all' ||
      (r.Products || []).some(p => p.Type === selectedType)

    return matchesSearch && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Product type breakdown for chart
  const typeBreakdown = {}
  recalls.forEach(r => {
    (r.Products || []).forEach(p => {
      const type = p.Type || 'Unknown'
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
    })
  })
  const typeChartData = Object.entries(typeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.length > 25 ? name.substring(0, 25) + '...' : name, fullName: name, value }))

  // Hazard types for pie chart
  const hazardBreakdown = {}
  recalls.forEach(r => {
    (r.Hazards || []).forEach(h => {
      const name = h.Name || 'Unknown'
      hazardBreakdown[name] = (hazardBreakdown[name] || 0) + 1
    })
  })
  const hazardChartData = Object.entries(hazardBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, fullName: name, value }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium">{payload[0].payload.fullName || payload[0].payload.name}</p>
          <p className="text-accent-cyan text-sm">{payload[0].value} recalls</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CPSC Product Recalls</h1>
          <p className="text-slate-400 text-sm mt-1">Consumer product recalls from SaferProducts.gov</p>
        </div>
        <button
          onClick={fetchRecalls}
          disabled={loading}
          className="px-4 py-2 bg-accent-purple/10 text-accent-purple rounded-lg text-sm font-medium hover:bg-accent-purple/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-accent-red text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Recalls" value={loading ? '...' : recalls.length} gradient />
        <StatsCard label="Filtered Results" value={loading ? '...' : filtered.length} />
        <StatsCard label="Product Types" value={loading ? '...' : productTypes.length} />
        <StatsCard label="Hazard Types" value={loading ? '...' : Object.keys(hazardBreakdown).length} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product type bar chart */}
        <div className="bg-card rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Top Product Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#CBD5E1', fontSize: 10 }} width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#A78BFA" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hazard type pie chart */}
        <div className="bg-card rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Hazard Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hazardChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#CBD5E1' }}
              >
                {hazardChartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0F172A" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search recalls by title, description, or product..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
            className="flex-1 px-4 py-2 bg-navy rounded-lg border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-accent-purple"
          />
          <select
            value={selectedType}
            onChange={e => { setSelectedType(e.target.value); setPage(1) }}
            className="px-4 py-2 bg-navy rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-accent-purple"
          >
            <option value="all">All Product Types</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Recall list */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading CPSC recall data...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No recalls found matching your criteria.</div>
        ) : (
          <div className="space-y-3">
            {paginated.map((recall, i) => (
              <div key={recall.RecallID || i} className="bg-navy rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{recall.Title || 'Untitled Recall'}</h4>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{recall.Description || ''}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(recall.Products || []).map((product, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-accent-indigo/20 text-accent-indigo">
                          {product.Name || product.Type || 'Unknown'}
                        </span>
                      ))}
                      {(recall.Hazards || []).map((hazard, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red">
                          {hazard.Name || 'Unknown Hazard'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-slate-500 text-xs">{recall.RecallDate || ''}</span>
                    {recall.URL && (
                      <a href={recall.URL} target="_blank" rel="noopener noreferrer" className="block text-accent-cyan text-xs mt-1 hover:underline">
                        Details
                      </a>
                    )}
                  </div>
                </div>
                {(recall.Manufacturers || []).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-slate-500 text-xs">Manufacturer: </span>
                    <span className="text-slate-300 text-xs">
                      {recall.Manufacturers.map(m => m.Name).join(', ')}
                    </span>
                  </div>
                )}
                {(recall.Remedies || []).length > 0 && (
                  <div className="mt-1">
                    <span className="text-slate-500 text-xs">Remedy: </span>
                    <span className="text-accent-green text-xs">
                      {recall.Remedies.map(r => r.Name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
