import { useState, useMemo } from 'react';
import BarChart from '../components/BarChart';
import ChoroplethMap from '../components/ChoroplethMap';
import { useCPSCRecallData } from '../hooks/useRecallData';

const CPSC_CATEGORIES = [
  '', 'Toys', 'Furniture', 'Electronics', 'Clothing',
  'Sports and Recreation', 'Household', 'Outdoor',
  'Kitchen', 'Children', 'Lighting',
];

export default function CPSCRecallsPage() {
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  const filters = useMemo(() => ({
    category,
    startDate,
    endDate,
  }), [category, startDate, endDate]);

  const { stateRecallCount, firmName, firmCount, loading, error } = useCPSCRecallData(filters);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">CPSC Product Recalls</h2>
            <hr className="border-[#334155] mb-3" />
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              Explore consumer product recalls from the Consumer Product Safety Commission (CPSC).
              Filter by product category and date range to update the chart and map.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#1E293B] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Filters</h3>

            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#CBD5E1] focus:border-[#22D3EE] focus:outline-none"
              >
                <option value="">All Categories</option>
                {CPSC_CATEGORIES.filter(Boolean).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#CBD5E1] focus:border-[#22D3EE] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#CBD5E1] focus:border-[#22D3EE] focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-[#1E293B] rounded-xl p-5 flex items-center justify-center h-[450px]">
              <div className="text-[#22D3EE] animate-pulse">Loading CPSC data...</div>
            </div>
          ) : (
            <BarChart firmName={firmName} firmCount={firmCount} title="Manufacturers with Most Recalls" />
          )}
        </div>

        {/* Right column: Map */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-3 text-[#F87171] text-sm">
              Error loading CPSC data: {error}
            </div>
          )}

          <ChoroplethMap stateRecallCount={stateRecallCount} />
        </div>
      </div>
    </div>
  );
}
