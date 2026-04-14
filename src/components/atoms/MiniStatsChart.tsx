import type { FC } from "react";
import { calculateFullSpread } from "../../utils/statsCalc";

interface MiniStatsChartProps {
  baseStats: Stats;
  sps: Stats;
  nature: Nature;
}

const STAT_KEYS: (keyof Stats)[] = ["hp", "atk", "def", "spe", "spd", "spa"];
const ANGLES = Array.from({ length: 6 }, (_, i) => -Math.PI / 2 + (i * Math.PI) / 3);
const MAX_STAT = 255;
const CX = 50;
const CY = 50;
const R = 36;

const pt = (angle: number, r: number) => ({
  x: CX + r * Math.cos(angle),
  y: CY + r * Math.sin(angle),
});

const MiniStatsChart: FC<MiniStatsChartProps> = ({ baseStats, sps, nature }) => {
  const final = calculateFullSpread(baseStats, sps, nature);
  const values = STAT_KEYS.map((k) => final[k]);

  const gridPoints = (frac: number) =>
    ANGLES.map((a) => {
      const p = pt(a, frac * R);
      return `${p.x},${p.y}`;
    }).join(" ");

  const statPolygon = ANGLES.map((a, i) => {
    const pct = Math.min(values[i] / MAX_STAT, 1);
    const p = pt(a, pct * R);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <polygon
          key={frac}
          points={gridPoints(frac)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
      ))}
      {ANGLES.map((a, i) => {
        const end = pt(a, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        );
      })}
      <polygon
        points={statPolygon}
        fill="rgba(74, 222, 128, 0.18)"
        stroke="rgba(74, 222, 128, 0.75)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniStatsChart;
