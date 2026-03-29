import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineHandRaised,
  HiOutlineClipboardDocumentList,
  HiPlus,
} from "react-icons/hi2";
import Tile from "../molecules/Tile";
import Button from "../atoms/Button";

const NAV_ITEMS = [
  {
    label: "Field Log",
    icon: <HiOutlineBookOpen size={18} />,
    path: "/journal",
  },
  { label: "Team Hub", icon: <HiOutlineUsers size={18} />, path: "/" },
  {
    label: "Data Vault",
    icon: <HiOutlineHandRaised size={18} />,
    path: "/vault",
  },
  {
    label: "Research Notes",
    icon: <HiOutlineClipboardDocumentList size={18} />,
    path: "/notes",
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
