import type { FC } from "react";
import { usePokemonData } from "../hooks/usePokemonData";

interface Props {
  member: Pokemon;
  onClick: () => void;
  onMove?: () => void;
  isSwapMode?: boolean;
}

const PcCard: FC<Props> = ({ member, onClick, onMove, isSwapMode }) => {
  const { species, activeBuildId, savedBuilds } = member;

  // Logic to determine display styling (shiny etc) needs to be consistent
  // Use equipped build if exists
  const equippedBuild = savedBuilds.find((b) => b.id === activeBuildId);
  const isShiny = equippedBuild?.isShiny || false;

  const { data, isLoading } = usePokemonData(species);

  const spriteUrl = isShiny
    ? data?.sprites.front_shiny
    : data?.sprites.front_default;

  return (
    <div
      onClick={onClick}
      className={`relative w-20 h-20 rounded-lg border transition-all cursor-pointer flex items-center justify-center group overflow-hidden
      ${
        isSwapMode
          ? "animate-pulse ring-2 ring-amber-500 bg-amber-500/10 border-amber-500"
          : "bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10"
      }`}
    >
      {isLoading ? (
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      ) : (
        <>
          <img
            src={spriteUrl}
            alt={species}
            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
          />
          {isShiny && (
            <span className="absolute top-1 right-1 text-xs">✨</span>
          )}

          {/* Move Button Overlay */}
          {!isSwapMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove?.();
              }}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10 text-xs font-bold text-amber-500 uppercase tracking-widest"
            >
              MOVE
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PcCard;
