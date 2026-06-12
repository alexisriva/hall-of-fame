import { useState, useEffect, type FC } from "react";
import { useGameStore, createEmptyBuild } from "../../store/gameStore";
import { usePokemonData } from "../../hooks/usePokemonData";
import Button from "../atoms/Button";
import TextInput from "../atoms/TextInput";
import Slider from "../atoms/Slider";
import Loading from "../atoms/Loading";
import MoveAutocomplete from "../molecules/MoveAutocomplete";
import MoveCard from "../molecules/MoveCard";
import StatsViewer from "../molecules/StatsViewer";
import { NATURES, STATS, TYPES } from "../../utils/constants";
import { capitalize, resolveBestSprite } from "../../utils/helpers";
import { parsePokepaste } from "../../utils/parsePokepaste";
import { reduceStats } from "../../utils/statsReducer";
import { getPokemonLearnset } from "../../utils/pkmnDataHelper";


const selectCls =
  "w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 appearance-none cursor-pointer transition-all";

interface BuildManagerProps {
  species: string;
  initialBuild?: PokemonBuild;
  onClose: () => void;
}

const BuildManager: FC<BuildManagerProps> = ({
  species,
  initialBuild,
  onClose,
}) => {
  const addBuild = useGameStore((s) => s.addBuild);
  const updateBuild = useGameStore((s) => s.updateBuild);

  const { data, isLoading } = usePokemonData(species);

  const [localBuild, setLocalBuild] = useState<PokemonBuild>(
    initialBuild ?? createEmptyBuild(species),
  );

  const [tab, setTab] = useState<"build" | "import">("build");
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");

  const baseStats: Stats = data
    ? reduceStats(data)
    : (initialBuild?.species?.baseStats ?? {
        hp: 0,
        atk: 0,
        def: 0,
        spa: 0,
        spd: 0,
        spe: 0,
      });

  const [spriteUrl, setSpriteUrl] = useState(
    initialBuild?.species?.sprite ?? "",
  );

  useEffect(() => {
    const updateSprite = async () => {
      if (data) {
        const url = await resolveBestSprite(data, localBuild.isShiny);
        setSpriteUrl(url);
      }
    };
    updateSprite();
  }, [data, localBuild.isShiny]);

  const [availableMoves, setAvailableMoves] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    async function loadMoves() {
      if (species) {
        const moves = await getPokemonLearnset(species);
        if (active) {
          setAvailableMoves(moves);
        }
      }
    }
    loadMoves();
    return () => {
      active = false;
    };
  }, [species]);

  const handleStatChange = (stat: (typeof STATS)[number], val: number) => {
    let newVal = Math.max(0, Math.min(32, val));

    const otherTotal = STATS.reduce(
      (acc, s) => (s === stat ? acc : acc + localBuild.sps[s]),
      0,
    );
    const remaining = 66 - otherTotal;
    if (newVal > remaining) {
      newVal = remaining;
    }

    setLocalBuild((prev) => ({
      ...prev,
      sps: { ...prev.sps, [stat]: newVal },
    }));
  };

  const handleMoveChange = (index: number, val: string) => {
    const newMoves = [...localBuild.moves] as [string, string, string, string];
    newMoves[index] = val;
    setLocalBuild((prev) => ({ ...prev, moves: newMoves }));
  };

  const handleImport = () => {
    if (!pasteText.trim()) {
      setParseError("Paste a pokepaste first.");
      return;
    }
    try {
      const parsed = parsePokepaste(pasteText);
      setLocalBuild((prev) => ({ ...prev, ...parsed }));
      setPasteText("");
      setParseError("");
      setTab("build");
    } catch {
      setParseError(
        "Could not parse the pokepaste. Check the format and try again.",
      );
    }
  };

  const handleSave = () => {
    const speciesData = data
      ? {
          name: data.species.name,
          form: data.name,
          sprite: spriteUrl || "",
          types: data.types.map((t) => t.type.name),
          baseStats: baseStats,
        }
      : initialBuild?.species;

    if (!speciesData) return;

    const buildToSave: PokemonBuild = {
      ...localBuild,
      species: speciesData,
    };
    if (initialBuild) {
      updateBuild(initialBuild.id, buildToSave);
    } else {
      addBuild(buildToSave);
    }
    onClose();
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading && !initialBuild) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const usedSps = STATS.reduce((acc, stat) => acc + localBuild.sps[stat], 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header: sprite + name + shiny */}
      <div className="flex items-center gap-5 pb-5 border-b border-white/5">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
          {spriteUrl ? (
            <img
              src={spriteUrl}
              alt={species}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-white/20 text-3xl capitalize">
              {species[0]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <input
            value={localBuild.name}
            onChange={(e) =>
              setLocalBuild((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Build Name"
            className="text-2xl font-bold bg-transparent text-white outline-none border-b border-transparent hover:border-white/10 focus:border-[#b22200]/50 transition-all placeholder:text-white/20 w-full"
          />
          <span className="text-white/30 text-xs tracking-widest capitalize">
            {data?.species.name || initialBuild?.species?.name || species}
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={localBuild.isShiny}
            onChange={(e) =>
              setLocalBuild((prev) => ({ ...prev, isShiny: e.target.checked }))
            }
            className="accent-[#b22200]"
          />
          <span className="text-white/50 text-sm">Shiny</span>
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {(["build", "import"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t
                ? "bg-[#b22200] text-white shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t === "build" ? "Build" : "Import Pokepaste"}
          </button>
        ))}
      </div>

      {/* Tab: Build */}
      {tab === "build" && (
        <>
          {/* Body: Item/Ability/Nature + Moves */}
          <div className="flex flex-col gap-6">
            {/* Item, Ability, Nature, Tera Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                  Held Item
                </span>
                <TextInput
                  value={localBuild.item}
                  onChange={(val) =>
                    setLocalBuild((prev) => ({ ...prev, item: val }))
                  }
                  placeholder="e.g. Life Orb"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                  Ability{" "}
                  {isLoading && (
                    <span className="lowercase text-[10px] animate-pulse">
                      (Loading...)
                    </span>
                  )}
                </span>
                <select
                  value={localBuild.ability}
                  onChange={(e) =>
                    setLocalBuild((prev) => ({
                      ...prev,
                      ability: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className={`${selectCls} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="" disabled className="bg-[#0F1115]">
                    Select Ability
                  </option>
                  {!isLoading &&
                    data?.abilities.map((a) => (
                      <option
                        key={a.ability.name}
                        value={a.ability.name}
                        className="bg-[#0F1115]"
                      >
                        {capitalize(a.ability.name.replace("-", " "))}{" "}
                        {a.is_hidden && "(Hidden)"}
                      </option>
                    ))}
                  {isLoading && localBuild.ability && (
                    <option value={localBuild.ability} className="bg-[#0F1115]">
                      {capitalize(localBuild.ability.replace("-", " "))}
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                  Nature
                </span>
                <select
                  value={localBuild.nature}
                  onChange={(e) =>
                    setLocalBuild((prev) => ({
                      ...prev,
                      nature: e.target.value as Nature,
                    }))
                  }
                  className={selectCls}
                >
                  {NATURES.map((n) => (
                    <option key={n} value={n} className="bg-[#0F1115]">
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                  Tera Type
                </span>
                <select
                  value={localBuild.teraType ?? ""}
                  onChange={(e) =>
                    setLocalBuild((prev) => ({
                      ...prev,
                      teraType: e.target.value || undefined,
                    }))
                  }
                  className={selectCls}
                >
                  <option value="" className="bg-[#0F1115]">
                    None
                  </option>
                  {Object.keys(TYPES).map((t) => (
                    <option key={t} value={t} className="bg-[#0F1115]">
                      {capitalize(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Moves */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                Moveset{" "}
                {isLoading && availableMoves.length === 0 && (
                  <span className="lowercase text-[10px] animate-pulse">
                    (Loading Suggestions...)
                  </span>
                )}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {localBuild.moves.map((move, i) => {
                  const hasMove = move && move.trim() !== "";
                  return hasMove ? (
                    <MoveCard
                      key={i}
                      moveName={move}
                      onClear={() => handleMoveChange(i, "")}
                    />
                  ) : (
                    <MoveAutocomplete
                      key={i}
                      value={move}
                      onChange={(val) => handleMoveChange(i, val)}
                      availableMoves={
                        availableMoves.length > 0
                          ? availableMoves
                          : (data?.moves.map((m) => m.move.name) ?? [])
                      }
                      placeholder={`Move ${i + 1}`}
                      disabled={isLoading && availableMoves.length === 0}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
              Stats — SPs ({usedSps} / 66 total)
            </span>
            <div className="rounded-xl bg-[#161C29] px-5 py-4 flex flex-col gap-3">
              {STATS.map((stat) => (
                <div key={stat} className="flex items-center gap-3">
                  <span className="text-white/30 text-xs font-mono uppercase w-8 shrink-0">
                    {stat}
                  </span>

                  <Slider
                    min={0}
                    max={32}
                    step={1}
                    value={localBuild.sps[stat]}
                    onChange={(val) => handleStatChange(stat, val)}
                  />

                  <input
                    type="number"
                    min={0}
                    max={32}
                    value={localBuild.sps[stat]}
                    onChange={(e) =>
                      handleStatChange(stat, Number(e.target.value))
                    }
                    className="w-12 bg-transparent text-right text-[#b22200] font-bold text-sm outline-none shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats Viewer */}
          <StatsViewer
            baseStats={baseStats}
            sps={localBuild.sps}
            nature={localBuild.nature}
          />

          {/* Save */}
          <div className="flex justify-end pt-1">
            <Button
              label="Save"
              variant="primary"
              onClick={handleSave}
              disabled={!data && !initialBuild}
            />
          </div>
        </>
      )}

      {/* Tab: Import */}
      {tab === "import" && (
        <div className="flex flex-col gap-4">
          <p className="text-white/40 text-xs leading-relaxed">
            Paste a Pokémon Showdown export below. Item, ability, nature, SPs
            (converted from EVs), and moves will be imported automatically.
          </p>

          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setParseError("");
            }}
            rows={10}
            placeholder={`Zapdos-Galar @ Grassy Seed\nAbility: Defiant\nLevel: 50\nSPs: 12 HP / 30 Atk / 2 Def / 2 SpD / 20 Spe\nJolly Nature\n- Acrobatics\n- Thunderous Kick\n- Coaching\n- Protect`}
            spellCheck={false}
            className="w-full resize-none rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white font-mono placeholder:text-white/15 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all leading-relaxed"
          />

          {parseError && (
            <span className="text-[#b22200] text-xs">{parseError}</span>
          )}

          <div className="flex justify-end">
            <Button
              label="Import"
              variant="primary"
              onClick={handleImport}
              disabled={!pasteText.trim()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildManager;
