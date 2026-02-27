import Plot from 'react-plotly.js';
import { COLORS } from '../utils/colors';

export default function BarChart({ firmName = [], firmCount = [], title = "Firms with Most Recalls" }) {
  const trace = {
    x: firmName,
    y: firmCount,
    opacity: 0.85,
    marker: {
      color: COLORS.primary,
      line: {
        color: COLORS.primary,
        width: 1,
      },
    },
    type: 'bar',
  };

  const layout = {
    autosize: true,
    title: {
      text: title,
      font: { size: 16, color: COLORS.primaryText },
    },
    height: 450,
    margin: { l: 50, r: 30, t: 50, b: 0 },
    xaxis: {
      title: { text: 'Firm Name', font: { color: COLORS.secondaryText } },
      automargin: true,
      tickangle: 90,
      tickfont: { color: COLORS.mutedText, size: 11 },
      gridcolor: COLORS.gridLine,
    },
    yaxis: {
      title: { text: 'Recalls', font: { color: COLORS.secondaryText } },
      automargin: true,
      tickfont: { color: COLORS.mutedText },
      gridcolor: COLORS.gridLine,
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: COLORS.secondaryText },
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-4">
      <Plot
        data={[trace]}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
