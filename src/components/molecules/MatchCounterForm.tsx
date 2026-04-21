import { useState, useEffect, type FC } from "react";
import Button from "../atoms/Button";
import TextArea from "../atoms/TextArea";
import Loading from "../atoms/Loading";
import { usePokemonData } from "../../hooks/usePokemonData";
import { resolveBestSprite } from "../../utils/helpers";
import { reduceStats } from "../../utils/statsReducer";

interface MatchCounterFormProps {
  onSubmit: (counter: MatchCounter) => void;
  onCancel: () => void;
  initialSpeciesName?: string;
  initialNotes?: string;
}

const EMPTY_BUILD = (): PokemonBuild => ({
  id: crypto.randomUUID(),
  name: "",
  species: {
    name: "",
    form: "",
    sprite: "",
    types: [],
    baseStats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  },
  isShiny: false,
  item: "",
  ability: "",
  nature: "Hardy",
  moves: ["", "", "", ""],
  sps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
});

const MatchCounterForm: FC<MatchCounterFormProps> = ({
  onSubmit,
  onCancel,
  initialSpeciesName,
  initialNotes,
}) => {
  const [speciesName, setSpeciesName] = useState(initialSpeciesName ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");

  const { data, isLoading } = usePokemonData(speciesName);

  const [spriteUrl, setSpriteUrl] = useState("");

  useEffect(() => {
    const updateSprite = async () => {
      const url = await resolveBestSprite(data);
      setSpriteUrl(url);
    };
    updateSprite();
  }, [data]);

  const handleSubmit = () => {
    if (!speciesName.trim() || !data) return;
    const pokemon: PokemonBuild = {
      ...EMPTY_BUILD(),
      name: speciesName.trim(),
      species: {
        name: data.species.name,
        form: data.name,
        sprite: spriteUrl,
        types: data.types.map((t) => t.type.name),
        baseStats: reduceStats(data),
      },
    };
    onSubmit({ pokemon, notes });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Preview */}
      <div className="flex flex-col items-center justify-center min-h-[100px] rounded-xl bg-white/5">
        {speciesName && isLoading ? (
          <Loading size="sm" />
        ) : spriteUrl ? (
          <img
            src={spriteUrl}
            alt="preview"
            className="w-20 h-20 object-contain"
          />
        ) : (
          <span className="text-white/25 text-xs italic">
            {speciesName ? "Not found" : "Preview"}
          </span>
        )}
      </div>

      {/* Species input */}
      <div className="flex flex-col gap-2">
        <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
          Pokemon Name
        </span>
        <input
          type="text"
          value={speciesName}
          onChange={(e) => setSpeciesName(e.target.value)}
          placeholder="e.g. Kyogre"
          className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all"
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
          Notes
        </span>
        <div className="rounded-xl bg-[#161C29] px-4 py-3">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Why is this a threat? How do you handle it?"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button label="Cancel" variant="secondary" onClick={onCancel} />
        <Button
          label={initialSpeciesName ? "Save Threat" : "Add Threat"}
          variant="primary"
          onClick={handleSubmit}
          disabled={!speciesName.trim() || isLoading || !data}
        />
      </div>
    </div>
  );
};

export default MatchCounterForm;
