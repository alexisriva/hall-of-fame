import { useState, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineSquare3Stack3D,
  HiOutlineBars3,
  HiXMark,
  HiOutlineBolt,
} from "react-icons/hi2";
import { TbTriangleSquareCircle } from "react-icons/tb";
import { SlTrophy } from "react-icons/sl";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Home", icon: <SlTrophy size={18} />, path: "/" },
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

const TopNav: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="relative z-40 md:hidden shrink-0">
      {/* Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0A0C10]">
        <div className="flex items-center gap-2">
          <img src={logo} width={30} alt="Logo" />
          <span className="text-white/80 font-semibold tracking-wide text-sm">
            Hall Of Fame
          </span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-white/50 hover:text-white/80 transition-colors p-1 cursor-pointer"
        >
          {open ? <HiXMark size={22} /> : <HiOutlineBars3 size={22} />}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-40 bg-[#0A0C10] border-t border-white/5 px-3 py-2 flex flex-col gap-0.5 shadow-lg">
            {NAV_ITEMS.map(({ label, icon, path }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left",
                  location.pathname === path
                    ? "bg-[#b22200]/15 text-[#b22200]"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80",
                ].join(" ")}
              >
                <span className="text-base leading-none">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TopNav;
