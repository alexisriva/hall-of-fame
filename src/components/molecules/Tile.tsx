import type { FC, ReactNode } from "react";

interface TileProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const Tile: FC<TileProps> = ({ label, icon, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left",
      active
        ? "bg-[#b22200]/15 text-[#b22200]"
        : "text-white/50 hover:bg-white/5 hover:text-white/80",
    ].join(" ")}
  >
    <span
      className="text-base leading-none"
    >
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

export default Tile;
