import { useState, useEffect, useCallback } from 'react';
import BarChart from '../components/BarChart';
import ChoroplethMap from '../components/ChoroplethMap';
import ClassificationFilter from '../components/ClassificationFilter';
import { useCurrentRecallData } from '../hooks/useRecallData';

export default function CurrentRecallsPage() {
  const [class1, setClass1] = useState(true);
  const [class2, setClass2] = useState(true);
  const [class3, setClass3] = useState(true);
  const [normalize, setNormalize] = useState(false);

  const { rawData, fetchData, getFilteredData, loading, error, dateInfo } = useCurrentRecallData();

  const graphData = rawData ? getFilteredData(class1, class2, class3) : {
    stateRecallCount: [],
    stateRecallDetails: null,
    firmName: [],
    firmCount: [],
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">Recent Recalls</h2>
            <hr className="border-[#334155] mb-3" />
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              View the most recent 100 FDA food recalls and filter by classification(s) to update the chart and map.
            </p>
          </div>
          {loading ? (
            <div className="bg-[#1E293B] rounded-xl p-5 flex items-center justify-center h-[450px]">
              <div className="text-[#22D3EE] animate-pulse">Loading...</div>
            </div>
          ) : (
            <BarChart firmName={graphData.firmName} firmCount={graphData.firmCount} />
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-[#22D3EE] text-[#0F172A] font-semibold rounded-lg hover:bg-[#06B6D4] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Loading...' : 'Update Records'}
              </button>

              <div className="text-xs text-[#94A3B8]">
                {dateInfo || (
                  <em className="text-[#475569]">No records currently loaded. Please update records.</em>
                )}
              </div>

              <div className="border-l border-[#334155] pl-4">
                <ClassificationFilter
                  class1={class1}
                  class2={class2}
                  class3={class3}
                  normalize={normalize}
                  onClass1Change={setClass1}
                  onClass2Change={setClass2}
                  onClass3Change={setClass3}
                  onNormalizeChange={setNormalize}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-3 text-[#F87171] text-sm">
              Error loading data: {error}
            </div>
          )}

          <ChoroplethMap
            stateRecallCount={graphData.stateRecallCount}
            normalize={normalize}
            stateRecallDetails={graphData.stateRecallDetails}
            showPopups={true}
          />
        </div>
      </div>
    </div>
  );
}
