import type { FC } from "react";
import { HiOutlineBars4, HiOutlineTrash } from "react-icons/hi2";
import { usePokemonData } from "../hooks/usePokemonData";
import { useGameStore } from "../store/gameStore";

interface Props {
  data: Pokemon;
  onClick: () => void;
  onMove?: () => void;
  isSwapMode?: boolean;
}

const typeColors: Record<string, string> = {
  normal: "bg-stone-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-600",
  ghost: "bg-purple-800",
  dragon: "bg-violet-600",
  steel: "bg-slate-400",
  dark: "bg-slate-800",
  fairy: "bg-pink-300",
};

const TeamCard: FC<Props> = ({
  data: pokemon,
  onClick,
  onMove,
  isSwapMode,
}) => {
  const deletePokemon = useGameStore((state) => state.deletePokemon);
  const { species, activeBuildId, savedBuilds } = pokemon;

  // Find the equipped build if it exists
  const equippedBuild = savedBuilds.find((b) => b.id === activeBuildId);

  // Use equipped build details or defaults (for display only)
  const displayName = equippedBuild?.name || species;
  const isShiny = equippedBuild?.isShiny || false;

  const { data, isLoading, error } = usePokemonData(species);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white/5 rounded-xl border border-white/10 p-6 h-[400px] flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-white/10 rounded-full mb-4"></div>
        <div className="h-6 bg-white/10 rounded w-32 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-20"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/5 rounded-xl border border-red-500/30 p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <p className="text-red-400 font-semibold mb-2">Oops!</p>
        <p className="text-sm text-gray-400">Failed to load {species}</p>
      </div>
    );
  }

  const spriteUrl = isShiny
    ? data.sprites.other?.["official-artwork"]?.front_shiny ||
      data.sprites.front_shiny
    : data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default;

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden bg-white/10 backdrop-blur-md rounded-xl border border-white/20 transition-all duration-300 transform 
      ${
        isSwapMode
          ? "animate-pulse ring-4 ring-amber-500 scale-95"
          : "hover:border-white/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20"
      }
      `}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="p-6 relative z-10 flex flex-col items-center h-full">
        <div className="relative w-40 h-40 mb-2 transition-transform duration-500 group-hover:scale-110">
          <img
            src={spriteUrl}
            alt={species}
            className="w-full h-full object-contain filter drop-shadow-xl"
          />
          {isShiny && (
            <div className="absolute top-0 left-4 text-yellow-300 text-2xl animate-bounce">
              ✨
            </div>
          )}
        </div>

        {/* Action Buttons - Only visible on hover and NOT in swap mode */}
        {!isSwapMode && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-50">
            {/* Move Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove?.();
              }}
              className="text-gray-400 hover:text-amber-400 p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 flex items-center justify-center"
              title="Move Pokemon"
            >
              <HiOutlineBars4 className="h-5 w-5" />
            </button>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Release ${displayName}?`)) {
                  deletePokemon(pokemon.id);
                }
              }}
              className="text-gray-400 hover:text-red-500 p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 flex items-center justify-center"
              title="Release Pokemon"
            >
              <HiOutlineTrash className="h-5 w-5" />
            </button>
          </div>
        )}

        <h3 className="text-3xl font-bold text-white capitalize mb-1 tracking-tight">
          {displayName}
        </h3>
        <p className="text-sm text-yellow-100 font-medium italic mb-4">
          {species}
        </p>

        <div className="flex gap-2 mb-6">
          {data.types.map((t) => (
            <span
              key={t.type.name}
              className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm ${
                typeColors[t.type.name] || "bg-gray-500"
              }`}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        <div className="w-full mt-auto bg-black/20 rounded-lg p-3 grid grid-cols-3 gap-y-3 gap-x-1 text-center">
          {[
            {
              label: "HP",
              val: data.stats.find((s) => s.stat.name === "hp")?.base_stat,
              color: "text-emerald-400",
            },
            {
              label: "ATK",
              val: data.stats.find((s) => s.stat.name === "attack")?.base_stat,
              color: "text-rose-400",
            },
            {
              label: "DEF",
              val: data.stats.find((s) => s.stat.name === "defense")?.base_stat,
              color: "text-orange-400",
            },
            {
              label: "SPA",
              val: data.stats.find((s) => s.stat.name === "special-attack")
                ?.base_stat,
              color: "text-fuchsia-400",
            },
            {
              label: "SPD",
              val: data.stats.find((s) => s.stat.name === "special-defense")
                ?.base_stat,
              color: "text-green-400",
            },
            {
              label: "SPE",
              val: data.stats.find((s) => s.stat.name === "speed")?.base_stat,
              color: "text-cyan-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-1"
            >
              <p className="text-[9px] text-gray-500 font-bold mb-0.5">
                {stat.label}
              </p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
