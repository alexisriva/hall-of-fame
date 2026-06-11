import { useState, useEffect, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineSquare3Stack3D,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBolt,
} from "react-icons/hi2";
import { TbTriangleSquareCircle } from "react-icons/tb";
import { SlTrophy } from "react-icons/sl";
import CoffeeButton from "../atoms/CoffeeButton";
import Tile from "../molecules/Tile";
import pokeball from "../../assets/pokeball.png";
import pkg from "../../../package.json";

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
  {
    label: "Assistant",
    icon: <HiOutlineBolt size={18} />,
    path: "/match-assistant",
  },
];

const Sidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const coffeeEnabled = import.meta.env.VITE_SHOW_COFFEE_BUTTON === "true";
  const [showCoffee, setShowCoffee] = useState(coffeeEnabled);

  useEffect(() => {
    if (!coffeeEnabled || collapsed) {
      setShowCoffee(false);
    } else {
      const t = setTimeout(() => setShowCoffee(true), 200);
      return () => clearTimeout(t);
    }
  }, [collapsed, coffeeEnabled]);

  return (
    <aside
      className={[
        "hidden md:flex shrink-0 h-screen flex-col gap-8 py-8 px-3 bg-[#0A0C10] transition-all duration-200",
        collapsed ? "w-16" : "w-48",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="px-1 flex flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          {collapsed && <img src={pokeball} width={36} alt="Logo" />}
          <p
            className="text-white/80 font-semibold tracking-wide leading-tight transition-opacity duration-100 whitespace-nowrap"
            style={{
              opacity: collapsed ? 0 : 1,
              transitionDelay: collapsed ? "0ms" : "120ms",
            }}
          >
            Hall of Fame
          </p>
        </div>
        <p
          className="flex gap-0.5 items-center text-white/25 text-xs mt-0.5 transition-opacity duration-100 whitespace-nowrap"
          style={{
            opacity: collapsed ? 0 : 1,
            transitionDelay: collapsed ? "0ms" : "120ms",
          }}
        >
          <img src={pokeball} width={18} alt="Logo" className="shrink-0" />
          Kanto v{pkg.version}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, icon, path }) => (
          <Tile
            key={path}
            label={label}
            icon={icon}
            active={location.pathname === path}
            collapsed={collapsed}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* Toggle */}
      <div className="mt-auto flex flex-col gap-3">
        {showCoffee && <CoffeeButton />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`${collapsed ? "justify-center" : "justify-end pr-3"} flex items-center w-full py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200 cursor-pointer`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <HiOutlineChevronRight size={16} />
          ) : (
            <HiOutlineChevronLeft size={16} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
