import { useState } from 'react';

export default function ClassificationFilter({ class1, class2, class3, normalize, onClass1Change, onClass2Change, onClass3Change, onNormalizeChange }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Normalize checkbox */}
      <label className="flex items-center gap-2 text-sm text-[#CBD5E1] cursor-pointer">
        <input
          type="checkbox"
          checked={normalize}
          onChange={(e) => onNormalizeChange(e.target.checked)}
          className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
        />
        Normalize by Population
      </label>

      {/* Classification checkboxes */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="text-sm text-[#CBD5E1]">Classification</span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#334155] text-[#94A3B8] text-xs hover:bg-[#475569] cursor-pointer"
          >
            i
          </button>
          {showInfo && (
            <div className="absolute z-50 top-8 left-0 w-80 bg-[#1E293B] border border-[#334155] rounded-lg p-3 text-xs text-[#CBD5E1] shadow-xl">
              <p className="font-bold text-[#22D3EE] mb-1">FDA Recall Classifications</p>
              <p className="mb-1"><strong>Class I:</strong> Reasonable probability of serious adverse health consequences or death.</p>
              <p className="mb-1"><strong>Class II:</strong> May cause temporary or medically reversible adverse health consequences.</p>
              <p><strong>Class III:</strong> Not likely to cause adverse health consequences.</p>
              <button onClick={() => setShowInfo(false)} className="mt-2 text-[#22D3EE] hover:underline cursor-pointer">Close</button>
            </div>
          )}
        </div>

        {[
          { label: 'I', checked: class1, onChange: onClass1Change },
          { label: 'II', checked: class2, onChange: onClass2Change },
          { label: 'III', checked: class3, onChange: onClass3Change },
        ].map(({ label, checked, onChange }) => (
          <label key={label} className="flex items-center gap-1 text-sm text-[#CBD5E1] cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
