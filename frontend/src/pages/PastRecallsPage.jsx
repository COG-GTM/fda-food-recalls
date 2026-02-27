import { useState, useMemo } from 'react';
import BarChart from '../components/BarChart';
import ChoroplethMap from '../components/ChoroplethMap';
import DateRangeSlider from '../components/DateRangeSlider';
import ClassificationFilter from '../components/ClassificationFilter';
import { useRecallData } from '../hooks/useRecallData';
import { generateDateRange, parseMonthYear } from '../utils/dateUtils';

const dateRange = generateDateRange(2012, 2019, 5);

export default function PastRecallsPage() {
  const [sliderValue, setSliderValue] = useState([12, 76]);
  const [class1, setClass1] = useState(true);
  const [class2, setClass2] = useState(true);
  const [class3, setClass3] = useState(true);
  const [normalize, setNormalize] = useState(false);

  const filters = useMemo(() => ({
    class1: String(class1),
    class2: String(class2),
    class3: String(class3),
    startDate: parseMonthYear(dateRange[sliderValue[0]]),
    endDate: parseMonthYear(dateRange[sliderValue[1]]),
  }), [class1, class2, class3, sliderValue]);

  const { stateRecallCount, firmName, firmCount, loading, error } = useRecallData(filters);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Summary + Bar chart */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">Past Recalls</h2>
            <hr className="border-[#334155] mb-3" />
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              Explore past FDA food recalls by setting date range and classification(s) to update the chart and map.
            </p>
          </div>
          {loading ? (
            <div className="bg-[#1E293B] rounded-xl p-5 flex items-center justify-center h-[450px]">
              <div className="text-[#22D3EE] animate-pulse">Loading...</div>
            </div>
          ) : (
            <BarChart firmName={firmName} firmCount={firmCount} />
          )}
        </div>

        {/* Right column: Filters + Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1E293B] rounded-xl p-5">
            <div className="flex flex-wrap items-start gap-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Filter Results</h3>
              </div>
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
              <div className="w-full md:w-64 lg:w-80">
                <DateRangeSlider
                  dateRange={dateRange}
                  value={sliderValue}
                  onChange={setSliderValue}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-3 text-[#F87171] text-sm">
              Error loading data: {error}
            </div>
          )}

          <ChoroplethMap stateRecallCount={stateRecallCount} normalize={normalize} />
        </div>
      </div>
    </div>
  );
}
