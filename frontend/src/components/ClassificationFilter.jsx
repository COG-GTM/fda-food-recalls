export default function ClassificationFilter({ class1, class2, class3, onToggle, normalize, onNormalize }) {
  const classes = [
    { key: 'class1', label: 'Class I', checked: class1, desc: 'Serious adverse health consequences or death' },
    { key: 'class2', label: 'Class II', checked: class2, desc: 'Temporary or medically reversible adverse health consequences' },
    { key: 'class3', label: 'Class III', checked: class3, desc: 'Not likely to cause adverse health consequences' },
  ]

  return (
    <div className="bg-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Filters</h3>
      </div>

      <div className="space-y-2">
        <p className="text-slate-400 text-xs uppercase tracking-wider">Recall Classification</p>
        {classes.map(c => (
          <label key={c.key} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={c.checked}
              onChange={() => onToggle(c.key)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-cyan focus:ring-accent-cyan/50"
            />
            <div>
              <span className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">
                {c.label}
              </span>
              <p className="text-slate-500 text-xs">{c.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {onNormalize && (
        <div className="pt-2 border-t border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={normalize}
              onChange={onNormalize}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-cyan focus:ring-accent-cyan/50"
            />
            <span className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">
              Normalize by Population
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
