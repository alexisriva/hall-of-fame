import type { FC } from "react";
import TypeIcon from "../atoms/TypeIcon";
import { TYPES } from "../../utils/constants";

function getTypeBg(type: string): string {
  return TYPES[type.toLowerCase() as keyof typeof TYPES] ?? "#1a1210";
}

interface PokemonCardProps {
  name: string;
  imageUrl: string;
  types?: string[];
  onClick?: () => void;
}

const PokemonCard: FC<PokemonCardProps> = ({
  name,
  imageUrl,
  types = [],
  onClick,
}) => (
  <div
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    className="relative flex flex-col rounded-2xl overflow-visible cursor-pointer group"
    style={{
      backgroundColor: getTypeBg(types[0] ?? ""),
      boxShadow: "0 12px 40px rgba(42, 55, 94, 0.06)",
      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}
  >
    {/* Image area — overflows the top of the card */}
    <div className="relative flex items-end justify-center h-64 overflow-visible">
      <img
        src={imageUrl}
        alt={name}
        className="absolute bottom-0 w-48 h-48 object-contain drop-shadow-[0_-8px_24px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
        style={{ transform: "translateY(-8px)" }}
      />
    </div>

    {/* Footer */}
    <div className="flex flex-col items-center gap-2 pb-5 pt-3 px-4">
      <span className="text-white font-semibold text-base capitalize tracking-wide">
        {name}
      </span>

      {types.length > 0 && (
        <div className="flex items-center gap-1.5">
          {types.map((type) => (
            <TypeIcon key={type} type={type} size={20} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default PokemonCard;
