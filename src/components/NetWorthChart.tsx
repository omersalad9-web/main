import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { NetWorthSnapshot } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';

interface NetWorthChartProps {
  data: NetWorthSnapshot[];
  width: number;
  height: number;
}

const PADDING = { top: 16, right: 8, bottom: 28, left: 8 };
const GOLD = '#E8B86D';

function buildPath(
  points: { x: number; y: number }[],
): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y}`;
  }

  // Catmull-Rom → cubic Bézier for smooth curve
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildAreaPath(
  points: { x: number; y: number }[],
  chartBottom: number,
): string {
  if (points.length === 0) return '';
  const linePath = buildPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`;
}

function formatShortCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `£${(value / 1_000).toFixed(0)}k`;
  }
  return `£${value.toFixed(0)}`;
}

export function NetWorthChart({ data, width, height }: NetWorthChartProps) {
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { points, minVal, maxVal } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], minVal: 0, maxVal: 0 };
    }

    const values = data.map((d) => d.total);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    // Add 5% padding to the value range so the line doesn't touch edges
    const range = rawMax - rawMin || 1;
    const minVal = rawMin - range * 0.05;
    const maxVal = rawMax + range * 0.05;
    const valRange = maxVal - minVal;

    const pts = data.map((d, i) => ({
      x: PADDING.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
      y: PADDING.top + (1 - (d.total - minVal) / valRange) * chartHeight,
    }));

    return { points: pts, minVal, maxVal };
  }, [data, chartWidth, chartHeight]);

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  const chartBottom = PADDING.top + chartHeight;
  const linePath = buildPath(points);
  const areaPath = buildAreaPath(points, chartBottom);

  const latestValue = data[data.length - 1]?.total ?? 0;
  const firstValue = data[0]?.total ?? 0;
  const delta = latestValue - firstValue;
  const isPositive = delta >= 0;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={GOLD} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          stroke={GOLD}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* Min / max labels */}
      <View style={[styles.labelRow, { width }]}>
        <Text style={styles.label}>{formatShortCurrency(minVal)}</Text>
        <Text style={[styles.delta, isPositive ? styles.deltaPos : styles.deltaNeg]}>
          {isPositive ? '+' : ''}
          {formatShortCurrency(delta)}
        </Text>
        <Text style={styles.label}>{formatShortCurrency(maxVal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  labelRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  },
  delta: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  deltaPos: {
    color: colors.positive,
  },
  deltaNeg: {
    color: colors.negative,
  },
});

export default NetWorthChart;
