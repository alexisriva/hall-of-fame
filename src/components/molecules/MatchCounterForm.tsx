import { useState, type FC } from "react";
import Button from "../atoms/Button";
import TextArea from "../atoms/TextArea";

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
    sprite: "",
    types: [],
    baseStats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  },
  isShiny: false,
  item: "",
  ability: "",
  nature: "Hardy",
  moves: ["", "", "", ""],
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
});

const MatchCounterForm: FC<MatchCounterFormProps> = ({
  onSubmit,
  onCancel,
  initialSpeciesName,
  initialNotes,
}) => {
  const [speciesName, setSpeciesName] = useState(initialSpeciesName ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");

  const handleSubmit = () => {
    if (!speciesName.trim()) return;
    const pokemon: PokemonBuild = {
      ...EMPTY_BUILD(),
      name: speciesName.trim(),
      species: {
        name: speciesName.trim().toLowerCase(),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesName.trim().toLowerCase()}.png`,
        types: [],
        baseStats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      },
    };
    onSubmit({ pokemon, notes });
  };

  return (
    <div className="flex flex-col gap-4">
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
          disabled={!speciesName.trim()}
        />
      </div>
    </div>
  );
};

export default MatchCounterForm;
