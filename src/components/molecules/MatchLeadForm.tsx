import { useState, type FC } from "react";
import Button from "../atoms/Button";
import TextArea from "../atoms/TextArea";

interface MatchLeadFormProps {
  roster: PokemonBuild[];
  onSubmit: (lead: MatchLead) => void;
  onCancel: () => void;
  initialPokemon?: PokemonBuild[];
  initialNotes?: string;
}

const MatchLeadForm: FC<MatchLeadFormProps> = ({
  roster,
  onSubmit,
  onCancel,
  initialPokemon,
  initialNotes,
}) => {
  const [selected, setSelected] = useState<PokemonBuild[]>(initialPokemon ?? []);
  const [notes, setNotes] = useState(initialNotes ?? "");

  const toggle = (build: PokemonBuild) => {
    setSelected((prev) => {
      if (prev.find((b) => b.id === build.id))
        return prev.filter((b) => b.id !== build.id);
      if (prev.length >= 2) return prev;
      return [...prev, build];
    });
  };

  const isSelected = (build: PokemonBuild) =>
    !!selected.find((b) => b.id === build.id);

  const isDisabled = (build: PokemonBuild) =>
    selected.length >= 2 && !isSelected(build);

  const handleSubmit = () => {
    if (selected.length !== 2) return;
    onSubmit({ pokemon: selected, notes });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pokemon picker */}
      <div className="flex flex-col gap-2">
        <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
          Select Lead Pokemon
        </span>
        <div className="grid grid-cols-3 gap-2">
          {roster.map((build) => (
            <button
              key={build.id}
              onClick={() => toggle(build)}
              disabled={isDisabled(build)}
              className={[
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200",
                isSelected(build)
                  ? "cursor-pointer bg-[#b22200]/20 ring-1 ring-[#b22200]/60"
                  : isDisabled(build)
                    ? "cursor-not-allowed opacity-30 bg-white/5"
                    : "cursor-pointer bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              {build.species?.sprite && (
                <img
                  src={build.species.sprite}
                  alt={build.species.name}
                  className="w-10 h-10 object-contain"
                />
              )}
              <span className="text-white/70 text-xs capitalize truncate w-full text-center">
                {build.species?.name ?? build.name}
              </span>
            </button>
          ))}
        </div>
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
            placeholder="Describe the lead strategy..."
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button label="Cancel" variant="secondary" onClick={onCancel} />
        <Button
          label={initialPokemon ? "Save Lead" : "Add Lead"}
          variant="primary"
          onClick={handleSubmit}
          disabled={selected.length !== 2}
        />
      </div>
    </div>
  );
};

export default MatchLeadForm;
