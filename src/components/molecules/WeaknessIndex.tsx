import type { FC } from "react";
import { HiExclamationTriangle, HiCheckCircle } from "react-icons/hi2";
import TypeIcon from "../atoms/TypeIcon";
import Tooltip from "../atoms/Tooltip";
import {
  useTeamAnalysis,
  type MultiplierBreakdown,
} from "../../hooks/useTeamAnalysis";
import { capitalize } from "../../utils/helpers";

const BREAKDOWN_LABELS: {
  key: keyof MultiplierBreakdown;
  label: string;
  multiplier: string;
}[] = [
  { key: "doubleWeak", label: "4× Weak", multiplier: "4" },
  { key: "weak", label: "2× Weak", multiplier: "2" },
  { key: "neutral", label: "Neutral", multiplier: "1" },
  { key: "resist", label: "Resist", multiplier: "0.5" },
  { key: "doubleResist", label: "Double Resist", multiplier: "0.25" },
  { key: "immune", label: "Immune", multiplier: "0" },
];

function TooltipContent({
  score,
  neutral,
  breakdown,
}: {
  score: number;
  neutral: number;
  breakdown: MultiplierBreakdown;
}) {
  const rows = BREAKDOWN_LABELS.filter(({ key }) => breakdown[key] > 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-white/8">
        <span className="text-white/40 text-xs">
          W<sub>t</sub> score
        </span>
        <span className="text-white/80 text-xs font-bold tabular-nums">
          {score % 1 === 0 ? score : score.toFixed(2)}
          <span className="text-white/30 font-normal">
            {" "}
            / {neutral} neutral
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map(({ key, label, multiplier }) => (
          <div key={key} className="flex items-center justify-between gap-6">
            <span className="text-white/50 text-xs">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-white/25 text-xs tabular-nums">
                ×{multiplier}
              </span>
              <span className="text-white/70 text-xs font-semibold tabular-nums w-3 text-right">
                {breakdown[key]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WeaknessIndexProps {
  members: PokemonBuild[];
}

const WeaknessIndex: FC<WeaknessIndexProps> = ({ members }) => {
  const { coverage, typeEntries } = useTeamAnalysis(members);

  const hasData = members.some((m) => m.species?.types?.length);

  if (!hasData) {
    return (
      <p className="text-white/25 text-sm text-center py-4">
        Add Pokémon with species data to see type analysis.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* STAB Coverage */}
      <div className="flex flex-col gap-3">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
          STAB Coverage
        </span>
        {coverage.length === 0 ? (
          <span className="text-white/25 text-sm">No coverage data.</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {coverage.map((type) => (
              <div
                key={type}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5"
              >
                <TypeIcon type={type} size={14} />
                <span className="text-white/70 text-xs font-medium capitalize">
                  {capitalize(type)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weakness Index */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            Weakness Index
          </span>
          <span className="text-white/20 text-xs">
            Optimal defense profile: W<sub>t</sub> &gt; 6.0
          </span>
        </div>
        {typeEntries.length === 0 ? (
          <span className="text-white/25 text-sm">No type data available.</span>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {typeEntries.map(
              ({ type, score, neutral, severe, caution, breakdown }) => (
                <div
                  key={type}
                  className={[
                    "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border",
                    severe
                      ? "bg-[#b22200]/10 border-[#b22200]/20"
                      : caution
                        ? "bg-amber-500/8 border-amber-500/15"
                        : "bg-emerald-500/5 border-emerald-500/10",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TypeIcon type={type} size={14} />
                    <span className="text-white/60 text-xs capitalize truncate">
                      {capitalize(type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Tooltip
                      content={
                        <TooltipContent
                          score={score}
                          neutral={neutral}
                          breakdown={breakdown}
                        />
                      }
                    >
                      {severe || caution ? (
                        <HiExclamationTriangle
                          size={13}
                          className={
                            severe ? "text-[#b22200]" : "text-amber-400"
                          }
                        />
                      ) : (
                        <HiCheckCircle
                          size={13}
                          className="text-emerald-500/60"
                        />
                      )}
                    </Tooltip>
                    <span
                      className={[
                        "text-xs font-bold tabular-nums",
                        severe
                          ? "text-[#b22200]"
                          : caution
                            ? "text-amber-400"
                            : "text-emerald-500/60",
                      ].join(" ")}
                    >
                      {score % 1 === 0 ? score : score.toFixed(2)}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaknessIndex;
