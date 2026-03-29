import type { FC } from "react";
import PokemonCard from "../molecules/PokemonCard";
import Tag from "../atoms/Tag";

interface RosterMember {
  name: string;
  imageUrl: string;
  types?: string[];
}

interface RosterSectionProps {
  members: RosterMember[];
  capacity: number;
  onCardClick?: (name: string) => void;
}

const RosterSection: FC<RosterSectionProps> = ({ members, capacity, onCardClick }) => (
  <section className="flex flex-col gap-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-white font-semibold text-lg tracking-tight">Active Roster</h2>
      <Tag label={`${members.length} / ${capacity} Assigned`} variant="default" />
    </div>

    {/* Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {members.map((m) => (
        <PokemonCard
          key={m.name}
          name={m.name}
          imageUrl={m.imageUrl}
          types={m.types}
          onClick={onCardClick ? () => onCardClick(m.name) : undefined}
        />
      ))}
    </div>
  </section>
);

export default RosterSection;
