import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Past FDA Recalls',
    desc: 'Explore historical FDA food recalls from 2012-2019 with interactive filters, bar charts, and choropleth maps.',
    to: '/past-recalls',
    color: 'from-accent-cyan to-accent-blue',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Recent FDA Recalls',
    desc: 'View the most recent 100 FDA food recalls pulled in real-time from the FDA API.',
    to: '/recent-recalls',
    color: 'from-accent-blue to-accent-indigo',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Trends Over Time',
    desc: 'Analyze recall trends by state from 2012-2019 with interactive line charts.',
    to: '/recalls-by-state',
    color: 'from-accent-indigo to-accent-purple',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'CPSC Product Recalls',
    desc: 'Browse consumer product recalls from the CPSC SaferProducts.gov database.',
    to: '/cpsc-recalls',
    color: 'from-accent-purple to-accent-red',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
            Recall Dashboard
          </span>
        </h1>
        <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
          A comprehensive dashboard for exploring FDA food recalls and CPSC consumer product recalls
          with interactive visualizations, maps, and real-time data.
        </p>
      </div>

      {/* Data sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-cyan" />
            <h3 className="text-white font-semibold text-sm">FDA OpenFDA</h3>
          </div>
          <p className="text-slate-400 text-sm">Food recall enforcement reports from the US Food & Drug Administration via the OpenFDA API and local database with 4,000+ records (2012-2019).</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-purple" />
            <h3 className="text-white font-semibold text-sm">CPSC SaferProducts.gov</h3>
          </div>
          <p className="text-slate-400 text-sm">Consumer product recall data from the Consumer Product Safety Commission via the SaferProducts.gov REST API.</p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(f => (
          <Link
            key={f.to}
            to={f.to}
            className="group bg-card rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {f.icon}
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
            <div className="mt-4 flex items-center text-accent-cyan text-sm font-medium">
              Explore
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
