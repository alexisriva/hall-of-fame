import type { FC } from "react";
import TypeIcon from "../atoms/TypeIcon";

interface BuildCardProps {
  build: PokemonBuild;
  onClick?: () => void;
}

const BuildCard: FC<BuildCardProps> = ({ build, onClick }) => {
  const types = build.species?.types ?? [];
  const sprite = build.species?.sprite;

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-[#161C29] px-5 pt-5 pb-4 flex flex-col gap-3 min-h-[160px] cursor-pointer group transition-all duration-200 hover:bg-[#1c2335]"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
    >
      {/* Build name + type icons */}
      <div className="flex flex-col gap-2 pr-20">
        <span className="text-white font-bold text-base leading-tight">
          {build.name}
        </span>
        {types.length > 0 && (
          <div className="flex items-center gap-1.5">
            {types.map((type) => (
              <TypeIcon key={type} type={type} />
            ))}
          </div>
        )}
      </div>

      {/* Nature + Item */}
      <div className="flex flex-col gap-0.5 mt-auto">
        <span className="text-white/40 text-xs">Nature: {build.nature}</span>
        <span className="text-white/40 text-xs">Item: {build.item || "—"}</span>
      </div>

      {/* Sprite */}
      {sprite && (
        <img
          src={sprite}
          alt={build.species?.name}
          className="absolute bottom-0 right-0 w-36 h-36 object-contain translate-y-2 translate-x-1 opacity-90 group-hover:scale-110 transition-transform duration-300 pointer-events-none"
        />
      )}
    </div>
  );
};

export default BuildCard;
