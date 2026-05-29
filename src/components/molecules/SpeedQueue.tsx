import { useState, type FC } from "react";
import { HiOutlineChevronDoubleUp, HiOutlineBolt, HiOutlineArrowsUpDown } from "react-icons/hi2";
import TypeIcon from "../atoms/TypeIcon";

export interface ActivePokemonSpeedState {
  id: string;
  name: string;
  spriteUrl: string;
  types: string[];
  baseSpeed: number;
  isPlayer: boolean;

  // Custom benchmark selected by user
  benchmark: "min" | "min_neutral" | "max_neutral" | "max_plus";

  // Modifiers
  tailwind: boolean;
  scarf: boolean;
  paralysis: boolean;
  stage: number; // -6 to +6
}

interface SpeedQueueProps {
  pokemonList: ActivePokemonSpeedState[];
  onUpdate: (id: string, updates: Partial<ActivePokemonSpeedState>) => void;
}

// Math for Level 50 Speed calculations
export function calculateRawSpeed(
  base: number,
  benchmark: ActivePokemonSpeedState["benchmark"],
  isPlayer?: boolean,
): number {
  if (isPlayer) {
    return base;
  }
  const level = 50;
  let iv = 31;
  let ev = 0;
  let nature = 1.0;

  switch (benchmark) {
    case "min":
      iv = 0;
      ev = 0;
      nature = 0.9;
      break;
    case "min_neutral":
      iv = 31;
      ev = 0;
      nature = 1.0;
      break;
    case "max_neutral":
      iv = 31;
      ev = 252;
      nature = 1.0;
      break;
    case "max_plus":
      iv = 31;
      ev = 252;
      nature = 1.1;
      break;
  }

  const raw =
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(raw * nature);
}

// Safe speed stage multiplier lookup to prevent dynamic property/bracket notation issues
export function getStageMultiplier(stage: number): number {
  switch (stage) {
    case -6: return 2 / 8;
    case -5: return 2 / 7;
    case -4: return 2 / 6;
    case -3: return 2 / 5;
    case -2: return 2 / 4;
    case -1: return 2 / 3;
    case 1: return 3 / 2;
    case 2: return 4 / 2;
    case 3: return 5 / 2;
    case 4: return 6 / 2;
    case 5: return 7 / 2;
    case 6: return 8 / 2;
    case 0:
    default:
      return 1.0;
  }
}

// Full modified speed math
export function calculateModifiedSpeed(p: ActivePokemonSpeedState): number {
  const raw = calculateRawSpeed(p.baseSpeed, p.benchmark, p.isPlayer);

  let multiplier = 1.0;
  if (p.tailwind) multiplier *= 2.0;
  if (p.scarf) multiplier *= 1.5;
  if (p.paralysis) multiplier *= 0.5;

  // Stat stages
  multiplier *= getStageMultiplier(p.stage);

  return Math.floor(raw * multiplier);
}

const SpeedQueue: FC<SpeedQueueProps> = ({ pokemonList, onUpdate }) => {
  const [playerTailwind, setPlayerTailwind] = useState(false);
  const [opponentTailwind, setOpponentTailwind] = useState(false);
  const [trickRoom, setTrickRoom] = useState(false);

  // Compute full sorted list
  const queue = pokemonList
    .map((p) => {
      // Override tailwind dynamically based on side global state
      const hasTailwind = p.isPlayer ? playerTailwind : opponentTailwind;
      const modifiedP = { ...p, tailwind: hasTailwind };
      const rawSpeed = calculateRawSpeed(modifiedP.baseSpeed, modifiedP.benchmark, modifiedP.isPlayer);
      return {
        ...modifiedP,
        rawSpeed,
        finalSpeed: calculateModifiedSpeed(modifiedP),
      };
    })
    .sort((a, b) => {
      if (trickRoom) {
        // Trick Room speed inversion (slowest moves first)
        return a.finalSpeed - b.finalSpeed || (a.isPlayer ? -1 : 1);
      } else {
        return b.finalSpeed - a.finalSpeed || (a.isPlayer ? -1 : 1);
      }
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Global Battle Modifiers Toolbar */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-white/2 border border-white/5 rounded-2xl shadow-inner">
        {/* Player Tailwind Toggle */}
        <button
          onClick={() => setPlayerTailwind(!playerTailwind)}
          className={[
            "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black cursor-pointer transition-all",
            playerTailwind
              ? "bg-sky-500/20 border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-pulse"
              : "border-white/5 bg-[#161C29]/50 text-white/30 hover:text-white/60 hover:bg-white/5",
          ].join(" ")}
        >
          <HiOutlineChevronDoubleUp size={15} />
          <span>Your Tailwind</span>
        </button>

        {/* Opponent Tailwind Toggle */}
        <button
          onClick={() => setOpponentTailwind(!opponentTailwind)}
          className={[
            "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black cursor-pointer transition-all",
            opponentTailwind
              ? "bg-[#b22200]/20 border-[#b22200]/40 text-[#b22200] shadow-[0_0_15px_rgba(178,34,0,0.15)] animate-pulse"
              : "border-white/5 bg-[#161C29]/50 text-white/30 hover:text-white/60 hover:bg-white/5",
          ].join(" ")}
        >
          <HiOutlineChevronDoubleUp size={15} />
          <span>Opp Tailwind</span>
        </button>

        {/* Trick Room Toggle */}
        <button
          onClick={() => setTrickRoom(!trickRoom)}
          className={[
            "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black cursor-pointer transition-all",
            trickRoom
              ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse"
              : "border-white/5 bg-[#161C29]/50 text-white/30 hover:text-white/60 hover:bg-white/5",
          ].join(" ")}
        >
          <HiOutlineArrowsUpDown size={15} />
          <span>Trick Room</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-white/40 pb-2 border-b border-white/5">
        <span className={trickRoom ? "text-purple-400 font-bold tracking-wide" : ""}>
          {trickRoom ? "DYNAMIC SPEED QUEUE (TRICK ROOM - ASCENDING)" : "DYNAMIC SPEED QUEUE (DESCENDING)"}
        </span>
        <span>LEVEL 50 RULES</span>
      </div>

      {queue.length === 0 ? (
        <div className="py-12 text-center text-white/20 text-sm">
          No Pokémon added to the matchup yet. Select teams on the left.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {queue.map((p, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={p.id}
                className={[
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
                  p.isPlayer
                    ? "bg-[#1E293B]/40 border-sky-500/10 hover:border-sky-500/30"
                    : "bg-[#1C1917]/40 border-[#b22200]/10 hover:border-[#b22200]/30",
                  isTop && "ring-1 ring-amber-500/40 bg-amber-500/2",
                ].join(" ")}
                style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}
              >
                {/* Ranking Index */}
                <div className="w-5 text-center text-xs font-bold tabular-nums text-white/30 shrink-0">
                  {idx + 1}
                </div>

                {/* Sprite */}
                <div className="relative shrink-0 bg-white/5 rounded-xl p-1 w-12 h-12 flex items-center justify-center">
                  <img
                    src={p.spriteUrl}
                    alt={p.name}
                    className="w-10 h-10 object-contain pointer-events-none"
                  />
                  {/* Small team indicator pill */}
                  <span
                    className={[
                      "absolute -bottom-1 -right-1 text-[8px] font-bold px-1 py-0.2 rounded-full",
                      p.isPlayer
                        ? "bg-sky-500 text-white"
                        : "bg-[#b22200] text-white",
                    ].join(" ")}
                  >
                    {p.isPlayer ? "YOU" : "OPP"}
                  </span>
                </div>

                {/* Info Block */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-white font-bold text-sm capitalize truncate">
                      {p.name}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      {p.types.map((type) => (
                        <TypeIcon key={type} type={type} size={14} />
                      ))}
                    </div>
                  </div>

                  {/* Benchmark Selector */}
                  {p.isPlayer ? (
                    <span className="text-[10px] font-bold text-sky-400 mt-1">
                      Custom SPs
                    </span>
                  ) : (
                    <select
                      value={p.benchmark}
                      onChange={(e) =>
                        onUpdate(p.id, { benchmark: e.target.value as any })
                      }
                      className="mt-1 text-[10px] w-fit font-medium text-white/40 bg-transparent border-none outline-none cursor-pointer hover:text-white/70 transition-colors"
                    >
                      <option value="max_plus" className="bg-[#0F1115]">
                        Jolly/Timid Max (252 EV+)
                      </option>
                      <option value="max_neutral" className="bg-[#0F1115]">
                        Neutral Max (252 EV)
                      </option>
                      <option value="min_neutral" className="bg-[#0F1115]">
                        Neutral Min (0 EV)
                      </option>
                      <option value="min" className="bg-[#0F1115]">
                        Trick Room Min (0 IV-)
                      </option>
                    </select>
                  )}
                </div>

                {/* Modifiers Toggles */}
                <div className="flex items-center gap-1 shrink-0">

                  {/* Scarf Toggle */}
                  <button
                    onClick={() => onUpdate(p.id, { scarf: !p.scarf })}
                    title="Choice Scarf (1.5x)"
                    className={[
                      "p-1.5 rounded-lg border text-xs cursor-pointer transition-all",
                      p.scarf
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                        : "border-white/5 text-white/20 hover:text-white/40 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <HiOutlineBolt size={14} />
                  </button>

                  {/* Paralysis Toggle */}
                  <button
                    onClick={() => onUpdate(p.id, { paralysis: !p.paralysis })}
                    title="Paralyzed (0.5x)"
                    className={[
                      "p-1.5 rounded-lg border text-xs cursor-pointer transition-all",
                      p.paralysis
                        ? "bg-[#b22200]/20 border-[#b22200]/40 text-[#b22200]"
                        : "border-white/5 text-white/20 hover:text-white/40 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="font-bold text-[9px] leading-none">
                      PAR
                    </span>
                  </button>

                  {/* Stat Stage Adjuster */}
                  <div className="flex items-center bg-white/5 rounded-lg border border-white/5 overflow-hidden shrink-0">
                    <button
                      onClick={() =>
                        onUpdate(p.id, { stage: Math.max(-6, p.stage - 1) })
                      }
                      className="px-1.5 py-1 text-white/30 hover:text-white/70 hover:bg-white/5 text-[9px] font-bold cursor-pointer transition-colors"
                      title="Speed Stage Down"
                    >
                      -
                    </button>
                    <span
                      className={[
                        "px-1.5 text-[9px] font-bold tabular-nums min-w-[20px] text-center",
                        p.stage > 0
                          ? "text-emerald-400"
                          : p.stage < 0
                            ? "text-[#b22200]"
                            : "text-white/30",
                      ].join(" ")}
                    >
                      {p.stage > 0 ? `+${p.stage}` : p.stage}
                    </span>
                    <button
                      onClick={() =>
                        onUpdate(p.id, { stage: Math.min(6, p.stage + 1) })
                      }
                      className="px-1.5 py-1 text-white/30 hover:text-white/70 hover:bg-white/5 text-[9px] font-bold cursor-pointer transition-colors"
                      title="Speed Stage Up"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Final Speed Metric */}
                <div className="flex flex-col items-end justify-center pl-2 shrink-0">
                  <span
                    className={[
                      "text-lg font-black tabular-nums tracking-tight leading-none",
                      p.finalSpeed > p.rawSpeed
                        ? "text-emerald-400"
                        : p.finalSpeed < p.rawSpeed
                          ? "text-[#b22200]"
                          : "text-white",
                    ].join(" ")}
                  >
                    {p.finalSpeed}
                  </span>
                  <span className="text-[9px] text-white/20 font-medium tabular-nums mt-0.5">
                    {p.isPlayer ? "tailored" : "base"} {p.baseSpeed}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpeedQueue;
