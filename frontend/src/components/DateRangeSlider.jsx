import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function DateRangeSlider({ dateRange, value, onChange }) {
  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <div className="px-2">
      <Slider
        range
        min={0}
        max={dateRange.length - 1}
        value={value}
        onChange={handleChange}
        allowCross={false}
        styles={{
          track: { backgroundColor: '#22D3EE', height: 6 },
          handle: {
            borderColor: '#22D3EE',
            backgroundColor: '#1E293B',
            height: 18,
            width: 18,
            marginTop: -6,
            opacity: 1,
          },
          rail: { backgroundColor: '#334155', height: 6 },
        }}
      />
      <div className="flex justify-between mt-2 text-sm text-[#CBD5E1]">
        <span>{dateRange[value[0]]}</span>
        <span>{dateRange[value[1]]}</span>
      </div>
    </div>
  );
}
