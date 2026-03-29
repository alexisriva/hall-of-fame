import type { FC } from "react";

// Eagerly import all type icons so Vite can bundle them correctly
const TYPE_ICONS: Record<string, string> = import.meta.glob(
  "../../assets/icons/*.svg",
  { eager: true, import: "default" },
) as Record<string, string>;

function getTypeIcon(type: string): string | undefined {
  return TYPE_ICONS[`../../assets/icons/${type.toLowerCase()}.svg`];
}

const TYPE_BG: Record<string, string> = {
  fire:     "#1f1108",
  water:    "#08121e",
  grass:    "#0c1a0c",
  electric: "#1a190a",
  psychic:  "#1e0c13",
  ice:      "#0a181e",
  dragon:   "#0e0c1e",
  dark:     "#101010",
  fairy:    "#1e0c19",
  normal:   "#141414",
  fighting: "#1a0d0a",
  flying:   "#0c1020",
  poison:   "#14091e",
  ground:   "#1a1408",
  rock:     "#141210",
  bug:      "#111a08",
  ghost:    "#0e0b1a",
  steel:    "#0e1318",
};

function getTypeBg(type: string): string {
  return TYPE_BG[type.toLowerCase()] ?? "#1a1210";
}

interface PokemonCardProps {
  name: string;
  imageUrl: string;
  types?: string[];
  onClick?: () => void;
}

const PokemonCard: FC<PokemonCardProps> = ({ name, imageUrl, types = [], onClick }) => (
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
          {types.map((type) => {
            const icon = getTypeIcon(type);
            return icon ? (
              <img
                key={type}
                src={icon}
                alt={type}
                title={type}
                className="w-5 h-5 object-contain"
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  </div>
);

export default PokemonCard;
