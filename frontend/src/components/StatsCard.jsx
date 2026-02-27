export default function StatsCard({ label, value, icon, gradient = false }) {
  return (
    <div className={`rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${
      gradient
        ? 'bg-gradient-to-r from-accent-cyan to-accent-indigo'
        : 'bg-card'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-wider font-medium ${gradient ? 'text-white/70' : 'text-slate-400'}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${gradient ? 'text-white' : 'text-white'}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={`text-2xl ${gradient ? 'text-white/50' : 'text-accent-cyan/50'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
