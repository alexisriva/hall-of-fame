import type { FC } from "react";
import { usePokemonData } from "../../hooks/usePokemonData";

interface Props {
  member: FirestoreTeamMember;
  onClick: () => void;
  isSelected: boolean;
}

// Simple card for the left sidebar list
const AdminTeamCard: FC<Props> = ({ member, onClick, isSelected }) => {
  // Use hook to get sprite for thumbnail
  const { data } = usePokemonData(member.name);
  const spriteUrl = member.isShiny
    ? data?.sprites.front_shiny
    : data?.sprites.front_default;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center space-x-4
        ${
          isSelected
            ? "bg-amber-900/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
        }`}
    >
      <div className="w-16 h-16 bg-black/20 rounded-lg flex items-center justify-center p-1 border border-white/5">
        {data ? (
          <img
            src={spriteUrl}
            alt={member.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
        )}
      </div>
      <div>
        <p className="font-bold text-white capitalize">{member.name}</p>
        <p className="text-xs text-gray-400">{member.role}</p>
      </div>
      {isSelected && (
        <div className="absolute right-4 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
      )}
    </div>
  );
};

export default AdminTeamCard;
