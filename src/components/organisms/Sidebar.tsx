import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { TbTriangleSquareCircle } from "react-icons/tb";
import { SlTrophy } from "react-icons/sl";
import Tile from "../molecules/Tile";
import logo from "../../assets/logo.svg";

const NAV_ITEMS = [
  {
    label: "Home",
    icon: <SlTrophy size={18} />,
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
];

const Sidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-48 shrink-0 h-screen flex flex-col gap-8 py-8 px-3 bg-[#0A0C10]">
      {/* Brand */}
      <div className="px-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <img src={logo} width={36} alt="Logo" />
          <p className="text-white/80 font-semibold tracking-wide leading-tight">
            Hall Of Fame
          </p>
        </div>
        <p className="text-white/25 text-xs mt-0.5">Kanto v1.1</p>
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
    </aside>
  );
};

export default Sidebar;
