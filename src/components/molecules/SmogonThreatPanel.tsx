import { useState, type FC } from "react";
import {
  HiOutlinePresentationChartBar,
  HiOutlineBriefcase,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import {
  type SmogonUsageStats,
  type SmogonSpeciesSets,
  getSmogonStatsKey,
} from "../../utils/smogonStats";
import Tag from "../atoms/Tag";

interface SmogonThreatPanelProps {
  speciesName: string;
  spriteUrl: string;
  usageData: Record<string, SmogonUsageStats>;
  setData: Record<string, SmogonSpeciesSets>;
  formatLabel: string;
}

const SmogonThreatPanel: FC<SmogonThreatPanelProps> = ({
  speciesName,
  spriteUrl,
  usageData,
  setData,
  formatLabel,
}) => {
  const [activeTab, setActiveTab] = useState<"stats" | "sets">("stats");

  const statsKey = getSmogonStatsKey(speciesName, usageData);
  const setsKey = getSmogonStatsKey(speciesName, setData);

  const pokemonStats = statsKey ? usageData[statsKey] : null;
  const pokemonSets = setsKey ? setData[setsKey] : null;

  // Sorting helper for usage records
  const getSortedRecords = (
    records: Record<string, number> | undefined,
    limit = 5,
  ) => {
    if (!records) return [];
    return Object.entries(records)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, val]) => ({ name: key, percentage: Math.round(val * 100) }));
  };

  const topMoves = getSortedRecords(pokemonStats?.moves, 6);
  const topItems = getSortedRecords(pokemonStats?.items, 4);
  const topAbilities = getSortedRecords(pokemonStats?.abilities, 3);
  const topSpreads = getSortedRecords(pokemonStats?.spreads, 4);

  const hasStats = topMoves.length > 0 || topItems.length > 0;
  const hasSets = pokemonSets && Object.keys(pokemonSets.sets).length > 0;

  return (
    <div
      className="flex flex-col gap-5 bg-[#161C29] p-5 rounded-2xl border border-white/5"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.12)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
        <div className="bg-white/5 p-2 rounded-xl border border-white/5 w-16 h-16 flex items-center justify-center shrink-0">
          <img
            src={spriteUrl}
            alt={speciesName}
            className="w-14 h-14 object-contain pointer-events-none"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider truncate">
            {formatLabel} Analysis
          </span>
          <h2 className="text-white font-black text-xl capitalize leading-tight truncate">
            {speciesName}
          </h2>
          {pokemonStats?.usage !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <Tag
                label={`VGC Usage: ${(pokemonStats.usage * 100).toFixed(2)}%`}
                variant="info"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(hasStats || hasSets) && (
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("stats")}
            disabled={!hasStats}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "stats"
                ? "bg-[#b22200] text-white shadow-sm"
                : "text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            <HiOutlinePresentationChartBar size={14} />
            Usage Statistics
          </button>
          <button
            onClick={() => setActiveTab("sets")}
            disabled={!hasSets}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "sets"
                ? "bg-[#b22200] text-white shadow-sm"
                : "text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            <HiOutlineBriefcase size={14} />
            Expert Sets
          </button>
        </div>
      )}

      {/* Content */}
      {!hasStats && !hasSets ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-white/5 rounded-xl">
          <HiOutlineExclamationCircle size={28} className="text-white/20" />
          <div className="text-center">
            <p className="text-white/40 text-sm font-semibold">
              No meta profile found
            </p>
            <p className="text-white/25 text-xs mt-1 max-w-xs px-4">
              Detailed statistics are unavailable for this species in the
              current regulation ladder.
            </p>
          </div>
        </div>
      ) : activeTab === "stats" && hasStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Moves Column */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
              Common Moves
            </h3>
            <div className="flex flex-col gap-2 bg-white/2 p-3 rounded-xl border border-white/5">
              {topMoves.map((m) => (
                <div key={m.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white font-bold capitalize">
                      {m.name}
                    </span>
                    <span className="text-white/40 tabular-nums">
                      {m.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Abilities Column */}
          <div className="flex flex-col gap-5">
            {/* Items */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                Top Items
              </h3>
              <div className="flex flex-col gap-2.5 bg-white/2 p-3 rounded-xl border border-white/5">
                {topItems.map((i) => (
                  <div
                    key={i.name}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-white font-bold capitalize">
                      {i.name}
                    </span>
                    <span className="text-emerald-400 font-semibold tabular-nums bg-emerald-400/5 px-2 py-0.5 rounded-md">
                      {i.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                Abilities
              </h3>
              <div className="flex flex-col gap-2 bg-white/2 p-3 rounded-xl border border-white/5">
                {topAbilities.map((a) => (
                  <div
                    key={a.name}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-white font-bold capitalize">
                      {a.name}
                    </span>
                    <span className="text-sky-400 font-semibold tabular-nums bg-sky-400/5 px-2 py-0.5 rounded-md">
                      {a.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spreads Column */}
          {topSpreads.length > 0 && (
            <div className="md:col-span-2 flex flex-col gap-3">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                Common EV/Nature Spreads (HP/Atk/Def/SpA/SpD/Spe)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/2 p-3 rounded-xl border border-white/5">
                {topSpreads.map((s) => {
                  const parts = s.name.split(":");
                  const nature = parts[0] || "Neutral";
                  const evs = parts[1] ? parts[1].split("/") : [];
                  return (
                    <div
                      key={s.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-black">
                          {nature} Nature
                        </span>
                        <span className="text-white/40 font-medium tabular-nums mt-0.5">
                          {evs.join(" / ")}
                        </span>
                      </div>
                      <span className="text-[#b22200] font-black bg-[#b22200]/10 px-2.5 py-1 rounded-lg tabular-nums">
                        {s.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "sets" && pokemonSets ? (
        <div className="flex flex-col gap-4">
          {Object.entries(pokemonSets.sets).map(([setName, setDetails]) => (
            <div
              key={setName}
              className="flex flex-col gap-3 bg-white/2 p-4 rounded-xl border border-white/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/5">
                <h3 className="text-white font-black text-sm capitalize">
                  {setName}
                </h3>
                {setDetails.nature && (
                  <Tag
                    label={`${setDetails.nature} Nature`}
                    variant="default"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                {/* Core Items */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 font-semibold">
                      Held Item:
                    </span>
                    <span className="text-white font-bold capitalize">
                      {setDetails.item || "Any"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-semibold">
                      Ability:
                    </span>
                    <span className="text-white font-bold capitalize">
                      {setDetails.ability || "Any"}
                    </span>
                  </div>

                  {setDetails.evs && (
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="text-white/40 font-semibold mb-1">
                        Target EVs:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(setDetails.evs).map(([stat, val]) => (
                          <span
                            key={stat}
                            className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-white/70 uppercase"
                          >
                            {stat}: {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Moves List */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-white/40 font-semibold mb-1">
                    Standard Moveset:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {setDetails.moves.map((move, idx) => {
                      const displayMove = Array.isArray(move)
                        ? move.join(" / ")
                        : move;
                      return (
                        <span
                          key={idx}
                          className="bg-[#b22200]/5 border border-[#b22200]/10 text-white font-bold px-2 py-1.5 rounded-lg text-center truncate capitalize text-[10px]"
                          title={displayMove}
                        >
                          {displayMove}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SmogonThreatPanel;
