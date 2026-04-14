import React from 'react';
import { NetWorthSnapshot } from '../types';
import { colors, fontSize, fontWeight } from '../constants/theme';

interface NetWorthChartProps {
  data: NetWorthSnapshot[];
  width: number;
  height: number;
}

/** Compute a Catmull-Rom spline path through the given points */
function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `£${(value / 1_000).toFixed(1)}k`;
  return `£${value.toFixed(0)}`;
}

const GRADIENT_ID = 'networth-gradient';
const PADDING = { top: 12, right: 8, bottom: 36, left: 8 };

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data, width, height }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: fontSize.sm,
        }}
      >
        No data
      </div>
    );
  }

  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d.total);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PADDING.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: PADDING.top + (1 - (d.total - minVal) / range) * chartHeight,
  }));

  const linePath = catmullRomPath(points);

  // Closed area path: line path + down to bottom-right + back to bottom-left
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const bottomY = PADDING.top + chartHeight;
  const areaPath =
    linePath +
    ` L ${lastPt.x},${bottomY} L ${firstPt.x},${bottomY} Z`;

  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const delta = lastVal - firstVal;
  const deltaPositive = delta >= 0;

  const styles: Record<string, React.CSSProperties> = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      width,
      height,
      position: 'relative',
    },
    labels: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: PADDING.left,
      right: PADDING.right,
      height: PADDING.bottom,
    },
    labelText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      color: colors.textMuted,
    },
    deltaText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: deltaPositive ? colors.positive : colors.negative,
    },
  };

  return (
    <div style={styles.wrapper}>
      <svg width={width} height={height - PADDING.bottom} viewBox={`0 0 ${width} ${height - PADDING.bottom}`} overflow="visible">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={colors.gold} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Filled area */}
        <path d={areaPath} fill={`url(#${GRADIENT_ID})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.gold}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End-point dot */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={4}
          fill={colors.gold}
          stroke={colors.surface}
          strokeWidth={2}
        />
      </svg>

      {/* Bottom labels */}
      <div style={styles.labels}>
        <span style={styles.labelText}>{formatCurrency(minVal)}</span>
        <span style={styles.deltaText}>
          {deltaPositive ? '+' : ''}{formatCurrency(delta)}
        </span>
        <span style={styles.labelText}>{formatCurrency(maxVal)}</span>
      </div>
    </div>
  );
};

export default NetWorthChart;
