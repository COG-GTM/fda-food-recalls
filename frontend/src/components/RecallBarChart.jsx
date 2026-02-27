import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function RecallBarChart({ firmNames, firmCounts, title = "Firms with Most Recalls" }) {
  const data = firmNames.map((name, i) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    fullName: name,
    recalls: firmCounts[i],
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium">{payload[0].payload.fullName}</p>
          <p className="text-accent-cyan text-sm">{payload[0].value} recalls</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card rounded-xl p-4">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" tick={{ fill: '#CBD5E1', fontSize: 12 }} axisLine={{ stroke: '#94A3B8' }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#CBD5E1', fontSize: 11 }}
            width={160}
            axisLine={{ stroke: '#94A3B8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="recalls" fill="#22D3EE" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
