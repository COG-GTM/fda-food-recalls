import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { stateArray, countRecallsByState } from '../utils/stateData';
import { COLORS, LINE_CHART_COLORS } from '../utils/colors';

const YEARS = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019'];

// Top states by general recall volume to show by default
const DEFAULT_VISIBLE = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];

export default function RecallsByStatePage() {
  const [yearlyData, setYearlyData] = useState(null);
  const [visibleStates, setVisibleStates] = useState(new Set(DEFAULT_VISIBLE));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNationalAvg, setShowNationalAvg] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch all years in parallel
    Promise.all(
      YEARS.map((year) =>
        fetch(`/data/${year}-01/${year}-12`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => countRecallsByState(data))
      )
    )
      .then((results) => {
        const data = {};
        for (let i = 0; i < YEARS.length; i++) {
          data[YEARS[i]] = results[i];
        }
        setYearlyData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!yearlyData) return [];

    return YEARS.map((year) => {
      const point = { year };
      const counts = yearlyData[year];
      for (let i = 0; i < stateArray.length; i++) {
        point[stateArray[i]] = counts[i];
      }
      // National average
      const total = counts.reduce((a, b) => a + b, 0);
      point['National Average'] = Math.round(total / counts.length);
      return point;
    });
  }, [yearlyData]);

  const toggleState = (state) => {
    setVisibleStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) {
        next.delete(state);
      } else {
        next.add(state);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#1E293B] rounded-xl p-12 flex items-center justify-center">
          <div className="text-[#22D3EE] animate-pulse text-lg">Loading recall data for all years...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-4 text-[#F87171]">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Description */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">Recalls by State</h2>
            <hr className="border-[#334155] mb-3" />
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              Explore FDA food recalls by state from 2012 to 2019. Select states from the list below to display them on the chart.
            </p>
          </div>

          {/* State selector */}
          <div className="bg-[#1E293B] rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <h3 className="text-sm font-bold text-white mb-3">Select States</h3>

            <label className="flex items-center gap-2 text-sm text-[#22D3EE] cursor-pointer mb-2 pb-2 border-b border-[#334155]">
              <input
                type="checkbox"
                checked={showNationalAvg}
                onChange={() => setShowNationalAvg(!showNationalAvg)}
                className="w-4 h-4 accent-[#22D3EE]"
              />
              National Average
            </label>

            {stateArray.map((state) => (
              <label key={state} className="flex items-center gap-2 text-xs text-[#CBD5E1] cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={visibleStates.has(state)}
                  onChange={() => toggleState(state)}
                  className="w-3 h-3 accent-[#22D3EE]"
                />
                {state}
              </label>
            ))}
          </div>
        </div>

        {/* Right column: Chart */}
        <div className="lg:col-span-3">
          <div className="bg-[#1E293B] rounded-xl p-5" style={{ height: '600px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="year"
                  stroke="#94A3B8"
                  tick={{ fill: '#CBD5E1', fontSize: 12 }}
                  label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#CBD5E1' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#CBD5E1', fontSize: 12 }}
                  label={{ value: 'Number of Recalls', angle: -90, position: 'insideLeft', fill: '#CBD5E1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#CBD5E1',
                  }}
                />
                <Legend wrapperStyle={{ color: '#CBD5E1' }} />

                {showNationalAvg && (
                  <Line
                    type="monotone"
                    dataKey="National Average"
                    stroke="#FBBF24"
                    strokeWidth={3}
                    dot={{ fill: '#FBBF24', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                )}

                {[...visibleStates].map((state, idx) => (
                  <Line
                    key={state}
                    type="monotone"
                    dataKey={state}
                    stroke={LINE_CHART_COLORS[idx % LINE_CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
