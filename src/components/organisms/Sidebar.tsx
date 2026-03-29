import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tile from "../molecules/Tile";
import Button from "../atoms/Button";

const IconFieldLog = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 5h5M5 8h5M5 11h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="10" y="3" width="4" height="11" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

const IconTeamHub = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 13c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="5" r="1.75" stroke="currentColor" strokeWidth="1.25" />
    <path d="M13.5 11.5c.9.4 1.5 1.1 1.5 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const IconDataVault = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 4v4c0 1.105 2.239 2 5 2s5-.895 5-2V4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8v4c0 1.105 2.239 2 5 2s5-.895 5-2V8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconResearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 2V1.5A1.5 1.5 0 017.5 0h1A1.5 1.5 0 0110 1.5V2" stroke="currentColor" strokeWidth="1.25" />
    <path d="M6 7h4M6 10h2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const NAV_ITEMS = [
  { label: "Field Log",      icon: <IconFieldLog />,   path: "/journal" },
  { label: "Team Hub",       icon: <IconTeamHub />,    path: "/" },
  { label: "Data Vault",     icon: <IconDataVault />,  path: "/vault" },
  { label: "Research Notes", icon: <IconResearch />,   path: "/notes" },
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
          icon={<IconPlus />}
          variant="primary"
          fullWidth
          onClick={onNewEntry}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
