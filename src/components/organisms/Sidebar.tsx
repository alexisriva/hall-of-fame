import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineSquare3Stack3D,
  HiOutlineClipboardDocumentList,
  HiPlus,
} from "react-icons/hi2";
import { TbMedal2, TbTriangleSquareCircle } from "react-icons/tb";
import Tile from "../molecules/Tile";
import Button from "../atoms/Button";

const NAV_ITEMS = [
  {
    label: "Hall of Fame",
    icon: <TbMedal2 size={18} />,
    path: "/",
  },
  {
    label: "Team Hub",
    icon: <HiOutlineSquare3Stack3D size={18} />,
    path: "/team-hub",
  },
  {
    label: "Builds",
    icon: <TbTriangleSquareCircle size={18} />,
    path: "/builds",
  },
  {
    label: "Journal",
    icon: <HiOutlineClipboardDocumentList size={18} />,
    path: "/journal",
  },
];

interface SidebarProps {
  onNewEntry?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ onNewEntry }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-48 shrink-0 h-screen flex flex-col gap-8 py-8 px-3 bg-[#0A0C10]">
      {/* Brand */}
      <div className="px-1">
        <p className="text-white/80 font-semibold text-sm tracking-wide leading-tight">
          Project Indigo
        </p>
        <p className="text-white/25 text-xs mt-0.5">Field Edition V2.4</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, icon, path }) => (
          <Tile
            key={path}
            label={label}
            icon={icon}
            active={location.pathname === path}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* New Entry CTA */}
      <div className="mt-auto px-1">
        <Button
          label="New Entry"
          icon={<HiPlus size={16} />}
          variant="primary"
          fullWidth
          onClick={onNewEntry}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
