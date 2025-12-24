import { useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore, createEmptyBuild } from "../store/gameStore";
import { usePokemonData } from "../hooks/usePokemonData";

const statLabels = ["hp", "atk", "def", "spa", "spd", "spe"] as const;

// Export constant for usage in UI
export const natures: Nature[] = [
  "Adamant",
  "Bashful",
  "Bold",
  "Brave",
  "Calm",
  "Careful",
  "Docile",
  "Gentle",
  "Hardy",
  "Hasty",
  "Impish",
  "Jolly",
  "Lax",
  "Lonely",
  "Mild",
  "Modest",
  "Naive",
  "Naughty",
  "Quiet",
  "Quirky",
  "Rash",
  "Relaxed",
  "Sassy",
  "Serious",
  "Timid",
];

const BuildManager: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { party, pc } = useGameStore();
  const pokemon = party.find((p) => p.id === id) || pc.find((p) => p.id === id);

  const saveBuild = useGameStore((state) => state.saveBuild);
  const deleteBuild = useGameStore((state) => state.deleteBuild);
  const toggleActiveBuildId = useGameStore(
    (state) => state.toggleActiveBuildId
  );

  const { data } = usePokemonData(pokemon?.species || "");

  // Always start with a fresh blank build.
  // User can load a saved build by clicking on it.
  const [localBuild, setLocalBuild] = useState<PokemonBuild | null>(
    pokemon ? createEmptyBuild(pokemon.species) : null
  );

  // Keep local state for active build to avoid laggy zustand updates on every slider move
  // We will sync back to store on blur or dedicated save interaction if needed
  // For now, let's sync directly but maybe debounce? Or just simple onChange.
  // Actually, straight zustand update is fine for this scale.

  if (!pokemon || !localBuild)
    return <div className="text-white p-10">Pokemon not found</div>;

  const handleStatChange = (
    stat: (typeof statLabels)[number],
    val: number,
    type: "evs" | "ivs"
  ) => {
    let newVal = val;

    if (type === "evs") {
      // 1. Snap to valid increments: 0, 4, 12, 20, 28... (4 + 8n)
      if (newVal <= 2) {
        newVal = 0;
      } else {
        // Calculate steps of 8 starting from 4
        // Formula: 4 + 8n
        const steps = Math.round((newVal - 4) / 8);
        newVal = 4 + steps * 8;

        // Clamp basic range
        if (newVal < 0) newVal = 0;
        if (newVal > 252) newVal = 252;
      }

      // 2. enforce 508 Limit
      // Calculate current total excluding the stat being modified
      const currentTotal = statLabels.reduce((acc, label) => {
        if (label === stat) return acc;
        return acc + localBuild.evs[label]; // Use localBuild
      }, 0);

      const remainingBuffer = 508 - currentTotal;

      // If our new value exceeds remaining budget, clamp it down
      if (newVal > remainingBuffer) {
        // Find largest valid EV <= remainingBuffer
        if (remainingBuffer < 4) {
          newVal = 0;
        } else {
          const maxSteps = Math.floor((remainingBuffer - 4) / 8);
          newVal = 4 + maxSteps * 8;
        }
      }
    } else {
      // IVs just clamp 0-31
      if (newVal < 0) newVal = 0;
      if (newVal > 31) newVal = 31;
    }

    setLocalBuild((prev) =>
      prev
        ? {
            // Update localBuild
            ...prev,
            [type]: {
              ...prev[type],
              [stat]: newVal,
            },
          }
        : prev
    );
  };

  const handleMoveChange = (index: number, val: string) => {
    const newMoves = [...localBuild.moves] as [string, string, string, string]; // Use localBuild
    newMoves[index] = val;
    setLocalBuild((prev) => (prev ? { ...prev, moves: newMoves } : prev)); // Update localBuild
  };

  const handleSave = () => {
    if (!localBuild) return;

    // Save full build object to store
    // Store handles Logic for New vs Update based on ID
    saveBuild(pokemon.id, localBuild);
  };

  const spriteUrl = localBuild.isShiny
    ? data?.sprites.other?.["official-artwork"]?.front_shiny ||
      data?.sprites.front_shiny
    : data?.sprites.other?.["official-artwork"]?.front_default ||
      data?.sprites.front_default;

  return (
    <div className="min-h-screen text-white p-4 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white"
        >
          &larr; Back to Hub
        </button>
        <h1 className="text-2xl font-bold">Build Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Editor */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
            <img
              src={spriteUrl}
              alt={pokemon.species}
              className="w-24 h-24 object-contain bg-black/20 rounded-full p-2 border border-white/10"
            />
            <div>
              <input
                value={localBuild.name}
                onChange={(e) =>
                  setLocalBuild((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
                className="text-3xl font-bold bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-500 outline-none w-full"
                placeholder="Build Name"
              />
              <p className="text-gray-400 uppercase tracking-widest text-xs mt-1">
                {pokemon.species}
              </p>
            </div>

            <div className="ml-auto">
              <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-3 py-1 rounded-full border border-white/5">
                <input
                  type="checkbox"
                  checked={localBuild.isShiny}
                  onChange={(e) =>
                    setLocalBuild((prev) =>
                      prev ? { ...prev, isShiny: e.target.checked } : prev
                    )
                  }
                />
                <span className="text-sm">Shiny</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Info */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Held Item
                </label>
                <input
                  value={localBuild.item}
                  onChange={(e) =>
                    setLocalBuild((prev) =>
                      prev ? { ...prev, item: e.target.value } : prev
                    )
                  }
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Leftovers"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Ability
                </label>
                <input
                  value={localBuild.ability}
                  onChange={(e) =>
                    setLocalBuild((prev) =>
                      prev ? { ...prev, ability: e.target.value } : prev
                    )
                  }
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Levitate"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Nature
                </label>
                <select
                  value={localBuild.nature}
                  onChange={(e) =>
                    setLocalBuild((prev) =>
                      prev
                        ? { ...prev, nature: e.target.value as Nature }
                        : prev
                    )
                  }
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none text-white appearance-none cursor-pointer"
                >
                  {natures.map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="bg-[#1a1a1a] text-white"
                    >
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Moves */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                Moveset
              </label>
              <div className="space-y-2">
                {localBuild.moves.map((move, i) => (
                  <input
                    key={i}
                    value={move}
                    onChange={(e) => handleMoveChange(i, e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none"
                    placeholder={`Move ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-gray-300">
              Stats (EVs / IVs)
            </h3>
            <div className="space-y-3">
              {statLabels.map((stat) => (
                <div
                  key={stat}
                  className="grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-1 text-right uppercase font-mono text-sm text-gray-400">
                    {stat}
                  </div>

                  {/* EV Slider */}
                  <div className="col-span-8 flex items-center gap-3">
                    {/* 
                       Slider Logic: 
                       Ranges from 0 to 32.
                       0 -> 0 EV
                       1 -> 4 EV
                       n -> 4 + (n-1)*8 EV
                     */}
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="1"
                      value={
                        localBuild.evs[stat] === 0
                          ? 0
                          : (localBuild.evs[stat] - 4) / 8 + 1
                      }
                      onChange={(e) => {
                        const step = Number(e.target.value);
                        const evVal = step === 0 ? 0 : 4 + (step - 1) * 8;
                        handleStatChange(stat, evVal, "evs");
                      }}
                      className="flex-1 accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      value={localBuild.evs[stat]}
                      onChange={(e) =>
                        handleStatChange(stat, Number(e.target.value), "evs")
                      }
                      className="w-12 bg-transparent text-right text-amber-400 font-bold outline-none"
                    />
                  </div>

                  {/* IV Input */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2 bg-black/20 rounded px-2">
                      <span className="text-xs text-gray-600">IV</span>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={localBuild.ivs[stat]}
                        onChange={(e) =>
                          handleStatChange(stat, Number(e.target.value), "ivs")
                        }
                        className="w-full bg-transparent text-center text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 ${
                pokemon.savedBuilds.find((b) => b.id === localBuild.id)
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {pokemon.savedBuilds.find((b) => b.id === localBuild.id)
                ? "Save Changes"
                : "Save to Library"}
            </button>
          </div>
        </div>

        {/* Right Col: Library */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Library</h2>

            <div className="space-y-4">
              {/* Render Saved Builds */}
              {pokemon.savedBuilds.map((build) => {
                const isActive = build.id === localBuild.id;
                const isEquipped = build.id === pokemon.activeBuildId;

                return (
                  <div
                    key={build.id}
                    onClick={() => setLocalBuild({ ...build })}
                    className={`
                      relative h-32 rounded-xl border-2 transition-all cursor-pointer group
                      ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500"
                          : "bg-black/20 border-white/10 hover:border-amber-500/50"
                      }
                    `}
                  >
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2 pr-16">
                        <span
                          className={`font-bold text-lg truncate ${
                            isActive ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {build.name}
                        </span>
                        {isActive && (
                          <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold ml-2 shrink-0">
                            EDITING
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400 mt-auto">
                        <span className="bg-white/5 px-2 py-1 rounded">
                          {build.nature}
                        </span>
                        <span className="bg-white/5 px-2 py-1 rounded truncate max-w-[100px]">
                          {build.item || "No Item"}
                        </span>
                      </div>
                    </div>

                    {/* Star (Equip) Button - Top Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActiveBuildId(pokemon.id, build.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10 ${
                        isEquipped
                          ? "text-amber-400"
                          : "text-gray-600 hover:text-amber-200"
                      }`}
                      title={
                        isEquipped
                          ? "Currently Equipped in Hub"
                          : "Set as Active in Hub"
                      }
                    >
                      {isEquipped ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Delete Button - Bottom Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this build?")) {
                          deleteBuild(pokemon.id, build.id);
                        }
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full hover:bg-black/60 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* "Create New" Slot - Only shows if < 3 builds */}
              {pokemon.savedBuilds.length < 3 && (
                <div
                  onClick={() => {
                    if (
                      confirm(
                        "Start a fresh build? This will clear current unsaved changes."
                      )
                    ) {
                      setLocalBuild(createEmptyBuild(pokemon.species));
                    }
                  }}
                  className="relative h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-500 hover:bg-black/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-gray-500 hover:text-amber-400"
                >
                  <span className="text-4xl mb-1">+</span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Create New
                  </span>
                </div>
              )}
            </div>

            <p className="mt-auto pt-4 text-xs text-center text-gray-500">
              Select a slot to load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildManager;
