import type { FC } from "react";
import PcCard from "./PcCard";

interface Props {
  members: Pokemon[];
  limit: number;
}

const PcGrid: FC<Props> = ({ members, limit }) => {
  // Fill visually with empty slots if needed, or just show list
  const emptySlots = Math.max(0, limit - members.length);

  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
      {members.map((member) => (
        <PcCard key={member.id} member={member} />
      ))}
      {[...Array(emptySlots)].map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-20 h-20 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center opacity-30"
        >
          <span className="text-2xl text-white/20">+</span>
        </div>
      ))}
    </div>
  );
};

export default PcGrid;
