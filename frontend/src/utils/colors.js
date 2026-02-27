// Color scheme based on enterprise dark theme guidelines

export const COLORS = {
  // Backgrounds
  pageBg: '#0F172A',
  cardBg: '#1E293B',
  cardBgAlt: '#243449',

  // Text
  primaryText: '#FFFFFF',
  secondaryText: '#CBD5E1',
  mutedText: '#94A3B8',

  // Accent colors
  primary: '#22D3EE',    // Teal cyan
  secondary: '#60A5FA',  // Blue
  tertiary: '#818CF8',   // Indigo
  quaternary: '#A78BFA', // Purple
  negative: '#F87171',   // Red
  positive: '#4ADE80',   // Green

  // Chart grid
  gridLine: 'rgba(255, 255, 255, 0.05)',
};

// Orange gradient for choropleth maps (preserving original app's orange theme)
export const CHOROPLETH_COLORS = [
  '#fff5eb',
  '#fee6ce',
  '#fdd0a2',
  '#fdae6b',
  '#fd8d3c',
  '#f16913',
  '#d94801',
  '#8c2d04',
];

/**
 * Get choropleth color based on value relative to min/max range.
 */
export function getChoroplethColor(density, max, min) {
  const range = max - min;
  const step = 0.125 * range;

  if (density >= max - step) return CHOROPLETH_COLORS[7];
  if (density >= max - 2 * step) return CHOROPLETH_COLORS[6];
  if (density >= max - 3 * step) return CHOROPLETH_COLORS[5];
  if (density >= max - 4 * step) return CHOROPLETH_COLORS[4];
  if (density >= max - 5 * step) return CHOROPLETH_COLORS[3];
  if (density >= max - 6 * step) return CHOROPLETH_COLORS[2];
  if (density >= max - 7 * step) return CHOROPLETH_COLORS[1];
  return CHOROPLETH_COLORS[0];
}

// Accent colors for line charts (multi-series)
export const LINE_CHART_COLORS = [
  '#22D3EE',
  '#60A5FA',
  '#818CF8',
  '#A78BFA',
  '#F472B6',
  '#FB923C',
  '#FBBF24',
  '#34D399',
  '#F87171',
  '#4ADE80',
];
