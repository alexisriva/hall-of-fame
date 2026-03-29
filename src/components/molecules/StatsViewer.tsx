import type { FC } from "react";
import { calculateFullSpread, NATURE_MODIFIERS } from "../../utils/statsCalc";

interface StatsViewerProps {
  baseStats: Stats;
  evs: Stats;
  ivs: Stats;
  nature: Nature;
}

// Maps PokeAPI modifier stat name → index in STAT_LABELS/STAT_KEYS arrays
const MODIFIER_TO_INDEX: Record<string, number> = {
  attack: 1,
  defense: 2,
  speed: 3,
  "special-defense": 4,
  "special-attack": 5,
};

// Clockwise from top: HP, Atk, Def, Spe, Spd, Spa
const STAT_LABELS = ["HP", "Attack", "Defense", "Speed", "Sp. Def", "Sp. Atk"];
const STAT_KEYS: (keyof Stats)[] = ["hp", "atk", "def", "spe", "spd", "spa"];
const ANGLES = Array.from({ length: 6 }, (_, i) => -Math.PI / 2 + (i * Math.PI) / 3);

const MAX_STAT = 255;
const CX = 160;
const CY = 142;
const R = 78;
const LABEL_R = 118;

const pt = (angle: number, r: number) => ({
  x: CX + r * Math.cos(angle),
  y: CY + r * Math.sin(angle),
});

const StatsViewer: FC<StatsViewerProps> = ({ baseStats, evs, ivs, nature }) => {
  const final = calculateFullSpread(baseStats, evs, ivs, nature);
  const values = STAT_KEYS.map((k) => final[k]);

  const { plus, minus } = NATURE_MODIFIERS[nature];
  const plusIndex = plus != null ? (MODIFIER_TO_INDEX[plus] ?? -1) : -1;
  const minusIndex = minus != null ? (MODIFIER_TO_INDEX[minus] ?? -1) : -1;

  const statPoints = ANGLES.map((a, i) => {
    const pct = Math.min(values[i] / MAX_STAT, 1);
    return pt(a, pct * R);
  });

  const gridPoints = (frac: number) =>
    ANGLES.map((a) => {
      const p = pt(a, frac * R);
      return `${p.x},${p.y}`;
    }).join(" ");

  const statPolygon = statPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
        Stats
      </span>
      <div className="rounded-xl bg-[#161C29] px-2 py-4 flex items-center justify-center">
        <svg viewBox="0 0 320 280" className="w-full max-w-xs">
          {/* Grid hexagons */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <polygon
              key={frac}
              points={gridPoints(frac)}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {ANGLES.map((a, i) => {
            const end = pt(a, R);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={end.x}
                y2={end.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            );
          })}

          {/* Stat polygon */}
          <polygon
            points={statPolygon}
            fill="rgba(74, 222, 128, 0.15)"
            stroke="rgba(74, 222, 128, 0.8)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Vertex dots */}
          {statPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4ade80" />
          ))}

          {/* Labels */}
          {ANGLES.map((a, i) => {
            const lp = pt(a, LABEL_R);
            const cos = Math.cos(a);
            const anchor =
              cos > 0.1 ? "start" : cos < -0.1 ? "end" : "middle";

            const isPlus = i === plusIndex;
            const isMinus = i === minusIndex;
            const labelColor = isPlus
              ? "#4ade80"
              : isMinus
                ? "#b22200"
                : "rgba(255,255,255,0.45)";
            const arrow = isPlus ? " ↑" : isMinus ? " ↓" : "";

            return (
              <text key={i} textAnchor={anchor}>
                <tspan
                  x={lp.x}
                  y={lp.y - 7}
                  fill={labelColor}
                  fontSize="10"
                  fontWeight={isPlus || isMinus ? "600" : "normal"}
                >
                  {STAT_LABELS[i]}
                  {arrow}
                </tspan>
                <tspan
                  x={lp.x}
                  y={lp.y + 8}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {values[i]}
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default StatsViewer;
