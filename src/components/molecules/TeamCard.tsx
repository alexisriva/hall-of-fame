import type { FC } from "react";
import { useGameStore } from "../../store/gameStore";

interface TeamCardProps {
  team: PokemonTeam;
  onClick?: () => void;
}

const TeamCard: FC<TeamCardProps> = ({ team, onClick }) => {
  const builds = useGameStore((s) => s.builds);
  const members = team.pokemon
    .map((id) => builds.find((b) => b.id === id))
    .filter(Boolean) as PokemonBuild[];

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-[#161C29] px-5 pt-5 pb-4 flex flex-col gap-4 min-h-[140px] cursor-pointer group transition-all duration-200 hover:bg-[#1c2335]"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
    >
      {/* Title row */}
      <div className="flex items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-bold text-base leading-tight">
            {team.name}
          </span>
          {team.regulation && (
            <span className="text-white/30 text-xs">{team.regulation}</span>
          )}
        </div>
      </div>

      {/* Sprite row */}
      <div className="flex items-end mt-auto">
        {members.length === 0 ? (
          <span className="text-white/15 text-xs italic">No members yet</span>
        ) : (
          <div className="flex gap-2.5 items-end">
            {members.map((build, i) =>
              build.species?.sprite ? (
                <img
                  key={build.id}
                  src={build.species.sprite}
                  alt={build.species.name}
                  title={build.species.name}
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                  style={{ marginLeft: i === 0 ? 0 : "-1rem", zIndex: i }}
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
