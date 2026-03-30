import type { FC, ReactNode } from "react";

interface TileProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const Tile: FC<TileProps> = ({ label, icon, active = false, collapsed = false, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={[
      "w-full flex items-center py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
      collapsed ? "justify-center px-0" : "gap-3 px-4",
      active
        ? "bg-[#b22200]/15 text-[#b22200]"
        : "text-white/50 hover:bg-white/5 hover:text-white/80",
    ].join(" ")}
  >
    <span className="text-base leading-none shrink-0">{icon}</span>
    <span
      className="whitespace-nowrap overflow-hidden transition-opacity duration-100"
      style={{
        opacity: collapsed ? 0 : 1,
        width: collapsed ? 0 : undefined,
        transitionDelay: collapsed ? "0ms" : "120ms",
      }}
    >
      {label}
    </span>
  </button>
);

export default Tile;
