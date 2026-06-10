import { useState, type FC } from "react";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiSparkles,
} from "react-icons/hi2";
import Modal from "./Modal";
import TypeIcon from "../atoms/TypeIcon";
import Tooltip from "../atoms/Tooltip";
import { capitalize } from "../../utils/helpers";
import {
  ALL_TYPES,
  getDefensiveMultiplier,
  getResistTypes,
} from "../../utils/typeChart";

interface DefensiveCoverageProps {
  members: PokemonBuild[];
}

const BREAKDOWN_LABELS = [
  { key: "doubleWeak" as const, label: "4× Weak", multiplier: "4" },
  { key: "weak" as const, label: "2× Weak", multiplier: "2" },
  { key: "neutral" as const, label: "Neutral", multiplier: "1" },
  { key: "resist" as const, label: "Resist", multiplier: "0.5" },
  { key: "doubleResist" as const, label: "Double Resist", multiplier: "0.25" },
  { key: "immune" as const, label: "Immune", multiplier: "0" },
];

const DefensiveCoverage: FC<DefensiveCoverageProps> = ({ members }) => {
  const [activeDetailType, setActiveDetailType] = useState<string | null>(null);
  const membersWithTypes = members.filter((m) => m.species?.types?.length);
  const neutral = membersWithTypes.length;

  if (!neutral) {
    return (
      <p className="text-white/25 text-sm text-center py-4">
        Add Pokémon with species data to see defensive coverage analysis.
      </p>
    );
  }

  // 1. Calculate combined defensive profile for all 18 types
  const typeEntries = ALL_TYPES.map((type) => {
    const breakdown = {
      immune: 0,
      doubleResist: 0,
      resist: 0,
      neutral: 0,
      weak: 0,
      doubleWeak: 0,
    };

    const switchIns: { pokemonName: string; multiplier: number }[] = [];
    let score = 0;

    membersWithTypes.forEach((member) => {
      const m = getDefensiveMultiplier(member.species!.types, type);
      score += m;

      // Track safe switch-ins (resistances/immunities)
      if (m <= 0.5) {
        switchIns.push({
          pokemonName: member.species!.form || member.name,
          multiplier: m,
        });
      }

      // Track multiplier breakdown
      if (m === 0) breakdown.immune++;
      else if (m === 0.25) breakdown.doubleResist++;
      else if (m === 0.5) breakdown.resist++;
      else if (m === 1) breakdown.neutral++;
      else if (m === 2) breakdown.weak++;
      else if (m === 4) breakdown.doubleWeak++;
    });

    // Determine status (Severe Weakness, Caution, Gap/No Switch-in, Good/Covered)
    let status: "severe" | "caution" | "gap" | "good" = "good";
    if (score >= neutral + 2) {
      status = "severe";
    } else if (score > neutral) {
      status = "caution";
    } else if (switchIns.length === 0) {
      status = "gap";
    }

    return {
      type,
      score,
      breakdown,
      switchIns,
      status,
    };
  });

  // Sort by severity: severe first, then caution, then gaps, then good
  const severityOrder = { severe: 0, caution: 1, gap: 2, good: 3 };
  const sortedEntries = [...typeEntries].sort((a, b) => {
    if (a.status !== b.status) {
      return severityOrder[a.status] - severityOrder[b.status];
    }
    return b.score - a.score; // secondary sort by score descending
  });

  const vulnerabilities = typeEntries.filter(
    (entry) => entry.status !== "good",
  );

  // Get status color mappings
  const getStatusClasses = (status: "severe" | "caution" | "gap" | "good") => {
    switch (status) {
      case "severe":
        return {
          bg: "bg-[#b22200]/10 border-[#b22200]/20 hover:border-[#b22200]/40",
          text: "text-[#b22200]",
          iconColor: "text-[#b22200]",
          label: "Severe",
        };
      case "caution":
        return {
          bg: "bg-amber-500/8 border-amber-500/15 hover:border-amber-500/30",
          text: "text-amber-400",
          iconColor: "text-amber-400",
          label: "Caution",
        };
      case "gap":
        return {
          bg: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/35",
          text: "text-orange-400",
          iconColor: "text-orange-400",
          label: "Gap",
        };
      default:
        return {
          bg: "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20",
          text: "text-emerald-500/60",
          iconColor: "text-emerald-500/60",
          label: "Covered",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Type Profile Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            Defensive Type Profile
          </span>
          <span className="text-white/20 text-xs">
            Sum of multipliers (score) & safe switch-ins across all members
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sortedEntries.map(
            ({ type, score, breakdown, switchIns, status }) => {
              const styles = getStatusClasses(status);

              const tooltipContent = (
                <div className="flex flex-col gap-2.5 text-left min-w-[210px]">
                  {/* Header: Score vs baseline */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40 text-[9px] uppercase font-bold">
                      DEFENSIVE SCORE:
                    </span>
                    <span className="text-white text-xs font-bold font-mono">
                      {score % 1 === 0 ? score : score.toFixed(2)}
                      <span className="text-white/30 font-normal">
                        {" "}
                        / {neutral} neutral
                      </span>
                    </span>
                  </div>

                  {/* Switch-ins List */}
                  <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                    <span className="text-white/40 text-[9px] uppercase font-bold">
                      SAFE SWITCH-INS ({switchIns.length}):
                    </span>
                    {switchIns.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {switchIns.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-xs gap-3"
                          >
                            <span className="text-white font-bold capitalize truncate max-w-[110px]">
                              {s.pokemonName}
                            </span>
                            <span className="text-emerald-400 font-semibold shrink-0">
                              {s.multiplier === 0
                                ? "Immune (0×)"
                                : `Resists (${s.multiplier}×)`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#b22200] font-semibold text-xs leading-relaxed">
                        ⚠️ No Pokémon resists this type!
                      </span>
                    )}
                  </div>

                  {/* Multipliers Breakdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 text-[9px] uppercase font-bold">
                      DAMAGE BREAKDOWN:
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {BREAKDOWN_LABELS.filter((l) => breakdown[l.key] > 0).map(
                        (l) => (
                          <div
                            key={l.key}
                            className="flex justify-between text-xs gap-4"
                          >
                            <span className="text-white/50">
                              {l.label} ({l.multiplier}×)
                            </span>
                            <span className="text-white font-semibold font-mono">
                              {breakdown[l.key]}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <Tooltip key={type} content={tooltipContent}>
                  <div
                    onClick={() => setActiveDetailType(activeDetailType === type ? null : type)}
                    className={[
                      "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer w-full",
                      styles.bg,
                      activeDetailType === type ? "ring-1 ring-white/20 opacity-100!" : "",
                    ].join(" ")}
                  >
                    {/* Left: Icon + Type Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <TypeIcon type={type} size={14} />
                      <span className="text-white/70 text-xs font-semibold capitalize truncate">
                        {capitalize(type)}
                      </span>
                    </div>

                    {/* Right: Icon + Score */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {status === "good" ? (
                        <HiCheckCircle size={14} className={styles.iconColor} />
                      ) : (
                        <HiExclamationTriangle
                          size={14}
                          className={styles.iconColor}
                        />
                      )}
                      <span
                        className={[
                          "text-xs font-bold tabular-nums",
                          styles.text,
                        ].join(" ")}
                      >
                        {score % 1 === 0 ? score : score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              );
            },
          )}
        </div>

        <Modal
          isOpen={activeDetailType !== null}
          title={activeDetailType ? `${capitalize(activeDetailType)} Defense Details` : ""}
          onClose={() => setActiveDetailType(null)}
        >
          {activeDetailType && (() => {
            const entry = typeEntries.find((e) => e.type === activeDetailType);
            if (!entry) return null;
            const { score: activeScore, breakdown, switchIns, status: activeStatus } = entry;
            const activeStyles = getStatusClasses(activeStatus);

            return (
              <div className="flex flex-col gap-4">
                {/* Header Status Row */}
                <div className="flex justify-between items-center bg-white/2 border border-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Defensive Rating
                  </span>
                  <span className={["text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-widest", activeStyles.bg, activeStyles.text].join(" ")}>
                    {activeStyles.label} ({activeScore % 1 === 0 ? activeScore : activeScore.toFixed(2)}×)
                  </span>
                </div>

                {/* Safe Switch-ins */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-white/45 text-[10px] uppercase font-bold tracking-wider">
                    SAFE SWITCH-INS ({switchIns.length}):
                  </span>
                  <div className="bg-[#0F1115]/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                    {switchIns.length > 0 ? (
                      switchIns.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-b-0 last:pb-0"
                        >
                          <span className="text-white font-bold capitalize">
                            {s.pokemonName}
                          </span>
                          <span className="text-emerald-400 font-semibold shrink-0">
                            {s.multiplier === 0
                              ? "Immune (0×)"
                              : `Resists (${s.multiplier}×)`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#b22200] font-semibold text-xs py-1">
                        ⚠️ No Pokémon resists this type!
                      </span>
                    )}
                  </div>
                </div>

                {/* Damage Breakdown */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-white/45 text-[10px] uppercase font-bold tracking-wider">
                    DAMAGE BREAKDOWN:
                  </span>
                  <div className="bg-[#0F1115]/50 border border-white/5 rounded-xl p-3 grid grid-cols-2 gap-2.5">
                    {BREAKDOWN_LABELS.map((l) => {
                      const count = breakdown[l.key] || 0;
                      return (
                        <div
                          key={l.key}
                          className={[
                            "flex justify-between items-center text-xs py-1.5 px-2.5 rounded-lg border",
                            count > 0 ? "border-white/5 bg-white/2" : "border-transparent opacity-25"
                          ].join(" ")}
                        >
                          <span className="text-white/50">{l.label}</span>
                          <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded-md">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>

      {/* 2. Proactive Recommendations */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
          Coverage Recommendations
        </span>

        {vulnerabilities.length === 0 ? (
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3.5">
            <HiSparkles size={20} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-400/80 text-xs font-semibold leading-relaxed">
              Perfect Defensive Coverage! Your team has safe switch-ins and no
              weaknesses across all 18 attacking types.
            </p>
          </div>
        ) : (
          <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-1.5 flex flex-col">
            {vulnerabilities.map(({ type, status, score }) => {
              const recommendationTypes = getResistTypes(type);
              const isSevere = status === "severe";
              const isCaution = status === "caution";

              return (
                <div
                  key={type}
                  className="flex items-start gap-4 flex-wrap sm:flex-nowrap border-b border-white/5 py-3.5 last:border-b-0"
                >
                  {/* Left Column: Gap/Weakness label */}
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <HiExclamationTriangle
                      size={14}
                      className={
                        isSevere
                          ? "text-[#b22200]"
                          : isCaution
                            ? "text-amber-400"
                            : "text-orange-400"
                      }
                    />
                    <span
                      className={[
                        "font-bold capitalize text-xs",
                        isSevere
                          ? "text-[#b22200]"
                          : isCaution
                            ? "text-amber-400"
                            : "text-orange-400",
                      ].join(" ")}
                    >
                      {capitalize(type)}{" "}
                      {isSevere ? "Weakness" : isCaution ? "Caution" : "Gap"}
                    </span>
                  </div>

                  {/* Right Column: Recommendations */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <p className="text-white/40 text-xs leading-relaxed">
                      {isSevere || isCaution ? (
                        <>
                          The team is weak to{" "}
                          <strong className="text-white/60 capitalize">
                            {type}
                          </strong>{" "}
                          attacks (score{" "}
                          {score % 1 === 0 ? score : score.toFixed(2)}).
                        </>
                      ) : (
                        <>
                          No members can safely switch into{" "}
                          <strong className="text-white/60 capitalize">
                            {type}
                          </strong>{" "}
                          attacks.
                        </>
                      )}{" "}
                      To gain a safe switch-in and lower this weakness, consider
                      adding:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {recommendationTypes.map((recType) => (
                        <div
                          key={recType}
                          className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg pl-1.5 pr-2 py-0.5 text-[10px] font-semibold text-white/70"
                        >
                          <TypeIcon type={recType} size={12} />
                          <span>{capitalize(recType)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefensiveCoverage;
