import { useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HiPlus } from "react-icons/hi2";
import { v4 as uuidv4 } from "uuid";
import { useGameStore } from "../../store/gameStore";
import PokemonCard from "../molecules/PokemonCard";
import Modal from "../molecules/Modal";
import Tag from "../atoms/Tag";
import TypeIcon from "../atoms/TypeIcon";
import Loading from "../atoms/Loading";
import Button from "../atoms/Button";
import {
  parsePokepaste,
  extractSpeciesFromLine,
} from "../../utils/parsePokepaste";
import { pokemonQueryOptions } from "../../hooks/usePokemonData";

interface RosterSectionProps {
  memberIds: string[];
  capacity?: number;
  onAdd?: (buildId: string) => void;
  onAddMultiple?: (buildIds: string[]) => void;
  onRemove?: (buildId: string) => void;
}

const RosterSection: FC<RosterSectionProps> = ({
  memberIds,
  capacity = 6,
  onAdd,
  onAddMultiple,
  onRemove,
}) => {
  const queryClient = useQueryClient();
  const builds = useGameStore((s) => s.builds);
  const addBuild = useGameStore((s) => s.addBuild);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState<"pick" | "bulk">("pick");

  // Bulk import state
  const [pasteText, setPasteText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const members = memberIds
    .map((id) => builds.find((b) => b.id === id))
    .filter(Boolean) as PokemonBuild[];

  const availableBuilds = builds.filter((b) => !memberIds.includes(b.id));
  const emptySlots = Math.max(0, capacity - members.length);

  const handlePick = (buildId: string) => {
    onAdd?.(buildId);
    setPickerOpen(false);
  };

  const closeModal = () => {
    setPickerOpen(false);
    setTab("pick");
    setPasteText("");
    setImportError("");
  };

  const handleBulkImport = async () => {
    const text = pasteText.trim();
    if (!text) return;

    setImportError("");
    setImporting(true);

    try {
      // Split by blank lines to get individual pokemon blocks
      const blocks = text
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter(Boolean);

      if (blocks.length === 0) {
        setImportError("No Pokémon found in the paste.");
        setImporting(false);
        return;
      }

      const slotsLeft = capacity - memberIds.length;
      const toImport = blocks.slice(0, slotsLeft);

      // Fetch API data for all pokemon in parallel
      const results = await Promise.allSettled(
        toImport.map(async (block) => {
          const firstLine = block.split("\n")[0].trim();
          const species = extractSpeciesFromLine(firstLine);
          const apiData = await queryClient.ensureQueryData(
            pokemonQueryOptions(species),
          );
          const parsed = parsePokepaste(block);

          const spriteUrl = parsed.isShiny
            ? apiData.sprites.other?.["official-artwork"]?.front_shiny ||
              apiData.sprites.front_shiny
            : apiData.sprites.other?.["official-artwork"]?.front_default ||
              apiData.sprites.front_default;

          const build: PokemonBuild = {
            id: uuidv4(),
            name: parsed.name ?? species,
            isShiny: parsed.isShiny ?? false,
            item: parsed.item ?? "",
            ability: parsed.ability ?? "",
            nature: parsed.nature ?? "Adamant",
            moves: parsed.moves,
            evs: parsed.evs,
            ivs: parsed.ivs,
            teraType: parsed.teraType,
            species: {
              name: species,
              sprite: spriteUrl || "",
              types: apiData.types.map(
                (t: { type: { name: string } }) => t.type.name,
              ),
            },
          };

          return build;
        }),
      );

      const failed: string[] = [];
      const created: PokemonBuild[] = [];

      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          created.push(r.value);
        } else {
          const firstLine = toImport[i].split("\n")[0].trim();
          failed.push(extractSpeciesFromLine(firstLine));
        }
      });

      created.forEach((build) => addBuild(build));
      onAddMultiple?.(created.map((b) => b.id));

      if (failed.length > 0) {
        setImportError(
          `Imported ${created.length} Pokémon. Could not fetch: ${failed.join(", ")}.`,
        );
      } else {
        closeModal();
      }
    } catch {
      setImportError("Unexpected error during import. Check the paste format.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg tracking-tight">
          Active Roster
        </h2>
        <Tag
          label={`${members.length} / ${capacity} Assigned`}
          variant="default"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {members.map((m) => (
          <PokemonCard
            key={m.id}
            name={m.name}
            imageUrl={m.species?.sprite ?? ""}
            types={m.species?.types}
            teraType={m.teraType}
            onClick={onRemove ? () => onRemove(m.id) : undefined}
          />
        ))}

        {/* Empty slots */}
        {onAdd &&
          Array.from({ length: emptySlots }).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => setPickerOpen(true)}
              className="rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center min-h-[200px] text-white/20 hover:border-[#b22200]/50 hover:text-[#b22200]/50 transition-colors cursor-pointer"
            >
              <HiPlus size={28} />
            </button>
          ))}
      </div>

      {/* Build picker modal */}
      <Modal isOpen={pickerOpen} title="Add to Roster" onClose={closeModal}>
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
          {(["pick", "bulk"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                tab === t
                  ? "bg-[#b22200] text-white shadow"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "pick" ? "Add to Roster" : "Bulk Import"}
            </button>
          ))}
        </div>

        {/* Tab: Pick */}
        {tab === "pick" && (
          <>
            {availableBuilds.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-6">
                No saved builds available. Create one in the Builds page first.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {availableBuilds.map((build) => (
                  <button
                    key={build.id}
                    onClick={() => handlePick(build.id)}
                    className="flex items-center gap-3 w-full rounded-xl bg-white/5 hover:bg-[#b22200]/10 hover:border-[#b22200]/20 border border-transparent px-4 py-3 transition-colors cursor-pointer text-left"
                  >
                    {build.species?.sprite && (
                      <img
                        src={build.species.sprite}
                        alt={build.species.name}
                        className="w-10 h-10 object-contain shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-white font-medium text-sm">
                        {build.name}
                      </span>
                      <span className="text-white/40 text-xs capitalize">
                        {build.species?.name ?? "Unknown"}
                      </span>
                    </div>
                    {build.species?.types && (
                      <div className="flex items-center gap-1 shrink-0">
                        {build.species.types.map((t) => (
                          <TypeIcon key={t} type={t} size={16} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Bulk Import */}
        {tab === "bulk" && (
          <div className="flex flex-col gap-4">
            <p className="text-white/40 text-xs leading-relaxed">
              Paste a full team export from Pokémon Showdown. Each Pokémon will
              be created as a new build and added to the roster (up to{" "}
              {emptySlots} remaining slot{emptySlots !== 1 ? "s" : ""}).
            </p>

            <textarea
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                setImportError("");
              }}
              rows={12}
              placeholder={`Zapdos-Galar @ Grassy Seed\nAbility: Defiant\nEVs: 92 HP / 236 Atk / 12 Def / 12 SpD / 156 Spe\nJolly Nature\n- Acrobatics\n- Thunderous Kick\n- Coaching\n- Protect\n\nIncineroar (M) @ Rocky Helmet\n...`}
              spellCheck={false}
              className="w-full resize-none rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white font-mono placeholder:text-white/15 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all leading-relaxed"
            />

            {importError && (
              <span className="text-[#b22200] text-xs">{importError}</span>
            )}

            <div className="flex items-center justify-end gap-3">
              {importing && <Loading size="sm" />}
              <Button
                label="Import Team"
                variant="primary"
                onClick={handleBulkImport}
                disabled={!pasteText.trim() || importing}
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default RosterSection;
