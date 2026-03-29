import { useState, type FC } from "react";
import { useGameStore, createEmptyBuild } from "../../store/gameStore";
import { usePokemonData } from "../../hooks/usePokemonData";
import Button from "../atoms/Button";
import TextInput from "../atoms/TextInput";
import Slider from "../atoms/Slider";
import Loading from "../atoms/Loading";

// ── Constants ────────────────────────────────────────────────────────────────

const statLabels = ["hp", "atk", "def", "spa", "spd", "spe"] as const;

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

const capitalize = (s: string) =>
  s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ── Select style (shared) ────────────────────────────────────────────────────

const allTypes = [
  "bug", "dark", "dragon", "electric", "fairy", "fighting",
  "fire", "flying", "ghost", "grass", "ground", "ice",
  "normal", "poison", "psychic", "rock", "steel", "water",
] as const;

const selectCls =
  "w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 appearance-none cursor-pointer transition-all";

// ── Pokepaste parser ─────────────────────────────────────────────────────────

const evKeyMap: Record<string, keyof Stats> = {
  HP: "hp",
  Atk: "atk",
  Def: "def",
  SpA: "spa",
  SpD: "spd",
  Spe: "spe",
};

function parsePokepaste(text: string): Partial<PokemonBuild> & {
  evs: Stats;
  ivs: Stats;
  moves: [string, string, string, string];
} {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const evs: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const ivs: Stats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  const moves: [string, string, string, string] = ["", "", "", ""];
  const result: Partial<PokemonBuild> & {
    evs: Stats;
    ivs: Stats;
    moves: [string, string, string, string];
  } = { evs, ivs, moves };

  let moveCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // First line: "Species @ Item" or "Species (nickname) @ Item"
    if (i === 0) {
      if (line.includes(" @ ")) {
        const atIdx = line.lastIndexOf(" @ ");
        result.item = line.slice(atIdx + 3).trim();
      }
      continue;
    }

    if (line.startsWith("Tera Type:")) {
      result.teraType = line.slice(10).trim().toLowerCase();
      continue;
    }

    if (line.startsWith("Shiny:")) {
      result.isShiny = line.slice(6).trim().toLowerCase() === "yes";
      continue;
    }

    if (line.startsWith("Ability:")) {
      result.ability = line
        .slice(8)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      continue;
    }

    if (line.startsWith("EVs:")) {
      line
        .slice(4)
        .trim()
        .split("/")
        .forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(\w+)$/);
          if (m) {
            const key = evKeyMap[m[2]];
            if (key) evs[key] = parseInt(m[1], 10);
          }
        });
      continue;
    }

    if (line.startsWith("IVs:")) {
      line
        .slice(4)
        .trim()
        .split("/")
        .forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(\w+)$/);
          if (m) {
            const key = evKeyMap[m[2]];
            if (key) ivs[key] = parseInt(m[1], 10);
          }
        });
      continue;
    }

    if (line.endsWith(" Nature")) {
      result.nature = line.slice(0, -7).trim() as Nature;
      continue;
    }

    if (line.startsWith("- ") && moveCount < 4) {
      moves[moveCount++] = line.slice(2).trim();
      continue;
    }
  }

  return result;
}

// ── MoveAutocomplete ─────────────────────────────────────────────────────────

interface MoveInputProps {
  value: string;
  onChange: (val: string) => void;
  availableMoves: string[];
  placeholder?: string;
}

const MoveAutocomplete: FC<MoveInputProps> = ({
  value,
  onChange,
  availableMoves,
  placeholder,
}) => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState(value);

  if (value !== query && !show) setQuery(value);

  const filtered =
    query === ""
      ? []
      : availableMoves
          .filter((m) => m.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          const val = capitalize(e.target.value.replace(/-/g, " "));
          setQuery(val);
          onChange(val);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-[#161C29] border border-white/5 rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1">
          {filtered.map((move) => (
            <div
              key={move}
              onMouseDown={(e) => {
                e.preventDefault();
                const val = capitalize(move.replace(/-/g, " "));
                setQuery(val);
                onChange(val);
                setShow(false);
              }}
              className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-[#b22200]/10 cursor-pointer transition-colors"
            >
              {capitalize(move.replace(/-/g, " "))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── BuildManager ─────────────────────────────────────────────────────────────

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

  // ── Sprite ─────────────────────────────────────────────────────────────────

  const spriteUrl = localBuild.isShiny
    ? data?.sprites.other?.["official-artwork"]?.front_shiny ||
      data?.sprites.front_shiny
    : data?.sprites.other?.["official-artwork"]?.front_default ||
      data?.sprites.front_default;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStatChange = (
    stat: (typeof statLabels)[number],
    val: number,
    type: "evs" | "ivs",
  ) => {
    let newVal = val;

    if (type === "evs") {
      if (newVal <= 2) newVal = 0;
      else {
        const steps = Math.round((newVal - 4) / 8);
        newVal = Math.max(0, Math.min(252, 4 + steps * 8));
      }
      const otherTotal = statLabels.reduce(
        (acc, s) => (s === stat ? acc : acc + localBuild.evs[s]),
        0,
      );
      const remaining = 508 - otherTotal;
      if (newVal > remaining) {
        newVal = remaining < 4 ? 0 : 4 + Math.floor((remaining - 4) / 8) * 8;
      }
    } else {
      newVal = Math.max(0, Math.min(31, newVal));
    }

    setLocalBuild((prev) => ({
      ...prev,
      [type]: { ...prev[type], [stat]: newVal },
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
      setParseError("Could not parse the pokepaste. Check the format and try again.");
    }
  };

  const handleSave = () => {
    if (!data) return;
    const buildToSave: PokemonBuild = {
      ...localBuild,
      species: {
        name: species.toLowerCase(),
        sprite: spriteUrl || "",
        types: data.types.map((t) => t.type.name),
      },
    };
    if (initialBuild) {
      updateBuild(initialBuild.id, buildToSave);
    } else {
      addBuild(buildToSave);
    }
    onClose();
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
            {species}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Item, Ability, Nature */}
            <div className="flex flex-col gap-4">
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
                  Ability
                </span>
                <select
                  value={localBuild.ability}
                  onChange={(e) =>
                    setLocalBuild((prev) => ({
                      ...prev,
                      ability: e.target.value,
                    }))
                  }
                  className={selectCls}
                >
                  <option value="" disabled className="bg-[#0F1115]">
                    Select Ability
                  </option>
                  {data?.abilities.map((a) => (
                    <option
                      key={a.ability.name}
                      value={a.ability.name}
                      className="bg-[#0F1115]"
                    >
                      {capitalize(a.ability.name.replace("-", " "))}{" "}
                      {a.is_hidden && "(Hidden)"}
                    </option>
                  ))}
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
                  {natures.map((n) => (
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
                  <option value="" className="bg-[#0F1115]">None</option>
                  {allTypes.map((t) => (
                    <option key={t} value={t} className="bg-[#0F1115]">
                      {capitalize(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Moves */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
                Moveset
              </span>
              <div className="flex flex-col gap-2">
                {localBuild.moves.map((move, i) => (
                  <MoveAutocomplete
                    key={i}
                    value={move}
                    onChange={(val) => handleMoveChange(i, val)}
                    availableMoves={data?.moves.map((m) => m.move.name) ?? []}
                    placeholder={`Move ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
              Stats — EVs / IVs
            </span>
            <div className="rounded-xl bg-[#161C29] px-5 py-4 flex flex-col gap-3">
              {statLabels.map((stat) => (
                <div key={stat} className="flex items-center gap-3">
                  <span className="text-white/30 text-xs font-mono uppercase w-8 shrink-0">
                    {stat}
                  </span>

                  <Slider
                    min={0}
                    max={32}
                    step={1}
                    value={
                      localBuild.evs[stat] === 0
                        ? 0
                        : (localBuild.evs[stat] - 4) / 8 + 1
                    }
                    onChange={(step) => {
                      const evVal = step === 0 ? 0 : 4 + (step - 1) * 8;
                      handleStatChange(stat, evVal, "evs");
                    }}
                  />

                  <input
                    type="number"
                    value={localBuild.evs[stat]}
                    onChange={(e) =>
                      handleStatChange(stat, Number(e.target.value), "evs")
                    }
                    className="w-12 bg-transparent text-right text-[#b22200] font-bold text-sm outline-none shrink-0"
                  />

                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5 shrink-0">
                    <span className="text-white/30 text-xs font-mono">IV</span>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={localBuild.ivs[stat]}
                      onChange={(e) =>
                        handleStatChange(stat, Number(e.target.value), "ivs")
                      }
                      className="w-8 bg-transparent text-white/70 text-sm text-center outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-1">
            <Button
              label="Save"
              variant="primary"
              onClick={handleSave}
              disabled={!data}
            />
          </div>
        </>
      )}

      {/* Tab: Import */}
      {tab === "import" && (
        <div className="flex flex-col gap-4">
          <p className="text-white/40 text-xs leading-relaxed">
            Paste a Pokémon Showdown export below. Item, ability, nature, EVs,
            IVs, and moves will be imported automatically.
          </p>

          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setParseError("");
            }}
            rows={10}
            placeholder={`Zapdos-Galar @ Grassy Seed\nAbility: Defiant\nLevel: 50\nEVs: 92 HP / 236 Atk / 12 Def / 12 SpD / 156 Spe\nJolly Nature\n- Acrobatics\n- Thunderous Kick\n- Coaching\n- Protect`}
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
