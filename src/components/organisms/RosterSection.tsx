import { useState, type FC } from "react";
import { HiPlus } from "react-icons/hi2";
import { useGameStore } from "../../store/gameStore";
import PokemonCard from "../molecules/PokemonCard";
import Modal from "../molecules/Modal";
import Tag from "../atoms/Tag";
import TypeIcon from "../atoms/TypeIcon";

interface RosterSectionProps {
  memberIds: string[];
  capacity?: number;
  onAdd?: (buildId: string) => void;
  onRemove?: (buildId: string) => void;
}

const RosterSection: FC<RosterSectionProps> = ({
  memberIds,
  capacity = 6,
  onAdd,
  onRemove,
}) => {
  const builds = useGameStore((s) => s.builds);
  const [pickerOpen, setPickerOpen] = useState(false);

  const members = memberIds
    .map((id) => builds.find((b) => b.id === id))
    .filter(Boolean) as PokemonBuild[];

  const availableBuilds = builds.filter((b) => !memberIds.includes(b.id));
  const emptySlots = Math.max(0, capacity - members.length);

  const handlePick = (buildId: string) => {
    onAdd?.(buildId);
    setPickerOpen(false);
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
            name={m.species?.name ?? m.name}
            imageUrl={m.species?.sprite ?? ""}
            types={m.species?.types}
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
      <Modal
        isOpen={pickerOpen}
        title="Add to Roster"
        onClose={() => setPickerOpen(false)}
      >
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
      </Modal>
    </section>
  );
};

export default RosterSection;
