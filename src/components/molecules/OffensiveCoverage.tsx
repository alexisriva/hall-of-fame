import { useState, type FC } from "react";
import { HiCheckCircle, HiExclamationTriangle } from "react-icons/hi2";
import TypeIcon from "../atoms/TypeIcon";
import Tooltip from "../atoms/Tooltip";
import Modal from "./Modal";
import { capitalize } from "../../utils/helpers";
import { ALL_TYPES, getSuperEffectiveTargets } from "../../utils/typeChart";
import { getMoveShowdownData } from "../../utils/pkmnDataHelper";

interface OffensiveCoverageProps {
  members: PokemonBuild[];
}

type CoverageSource = {
  pokemonName: string;
  moveName: string;
  moveType: string;
};

const OffensiveCoverage: FC<OffensiveCoverageProps> = ({ members }) => {
  const [activeDetailType, setActiveDetailType] = useState<string | null>(null);
  const hasData = members.some((m) => m.species?.types?.length);

  // 1. Gather coverage information
  const coverageMap: Record<string, CoverageSource[]> = {};
  for (const type of ALL_TYPES) {
    coverageMap[type] = [];
  }

  if (hasData) {
    members.forEach((member) => {
      const pokemonName = member.species?.form || member.name;
      member.moves.forEach((moveName) => {
        if (!moveName || moveName.trim() === "") return;

        const moveData = getMoveShowdownData(moveName);
        if (moveData && moveData.category !== "Status") {
          const moveType = moveData.type.toLowerCase();
          const superEffectiveTargets = getSuperEffectiveTargets(moveType);

          superEffectiveTargets.forEach((target) => {
            if (coverageMap[target]) {
              // Avoid duplicate move entries for the same pokemon
              const exists = coverageMap[target].some(
                (src) =>
                  src.pokemonName === pokemonName && src.moveName === moveData.name,
              );
              if (!exists) {
                coverageMap[target].push({
                  pokemonName,
                  moveName: moveData.name,
                  moveType: moveData.type,
                });
              }
            }
          });
        }
      });
    });
  }

  if (!hasData) {
    return (
      <p className="text-white/25 text-sm text-center py-4">
        Add Pokémon with moves to see offensive type coverage analysis.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
          Type Coverage
        </span>
        <span className="text-white/20 text-xs">
          Shows types hit for supereffective damage by damaging moves
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ALL_TYPES.map((type) => {
          const sources = coverageMap[type] || [];
          const isCovered = sources.length > 0;

          return (
            <Tooltip
              key={type}
              content={
                isCovered ? (
                  <div className="flex flex-col gap-1.5 text-left min-w-[200px]">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[9px]">
                      SUPEREFFECTIVE COVERAGE BY:
                    </span>
                    <div className="flex flex-col gap-1">
                      {sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs gap-3 border-b border-white/5 pb-1 last:border-b-0 last:pb-0"
                        >
                          <span className="text-white font-bold capitalize truncate max-w-[90px]">
                            {src.pokemonName}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-white/70 truncate max-w-[100px]" title={src.moveName}>
                              {src.moveName}
                            </span>
                            <span className="text-white/30 text-[10px]">
                              ({src.moveType})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs">No supereffective moves for this type.</span>
                )
              }
            >
              <div
                onClick={() => setActiveDetailType(activeDetailType === type ? null : type)}
                className={[
                  "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer w-full",
                  isCovered
                    ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20"
                    : "bg-white/2 border-white/5 opacity-40 hover:opacity-75",
                  activeDetailType === type
                    ? "ring-1 ring-emerald-500/40 border-emerald-500/30 bg-emerald-500/10 opacity-100!"
                    : "",
                ].join(" ")}
              >
                {/* Left Side: Type name and icon */}
                <div className="flex items-center gap-2 min-w-0">
                  <TypeIcon type={type} size={14} />
                  <span
                    className={[
                      "text-xs capitalize truncate",
                      isCovered ? "text-white/70 font-medium" : "text-white/35",
                    ].join(" ")}
                  >
                    {capitalize(type)}
                  </span>
                </div>

                {/* Right Side: Status indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isCovered ? (
                    <HiCheckCircle size={14} className="text-emerald-500/70" />
                  ) : (
                    <HiExclamationTriangle size={14} className="text-amber-500/30" />
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <Modal
        isOpen={activeDetailType !== null}
        title={activeDetailType ? `${capitalize(activeDetailType)} Coverage Details` : ""}
        onClose={() => setActiveDetailType(null)}
      >
        {activeDetailType && (() => {
          const sources = coverageMap[activeDetailType] || [];
          if (sources.length === 0) {
            return (
              <p className="text-white/35 text-xs py-1">
                No damaging moves in your team hit {capitalize(activeDetailType)} for super effective damage.
              </p>
            );
          }
          return (
            <div className="flex flex-col gap-3">
              <span className="text-white/45 text-[10px] font-bold uppercase tracking-wider">
                SUPEREFFECTIVE ATTACKS BY:
              </span>
              <div className="flex flex-col gap-2 bg-[#0F1115]/50 border border-white/5 rounded-xl p-3">
                {sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-b-0 last:pb-0"
                  >
                    <span className="text-white font-bold capitalize">
                      {src.pokemonName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <span className="text-white/85 font-semibold">
                        {src.moveName}
                      </span>
                      <span className="text-white/40 text-[10px]">
                        ({src.moveType})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default OffensiveCoverage;
