import type { FC } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Header: FC = () => {
  return (
    <header className="pt-8 pb-8 text-center relative z-10 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-900/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-4">
        <img
          src={logo}
          alt="Hall of Fame Logo"
          className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
        />
        <h1 className="relative text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
          HALL OF FAME
        </h1>
      </div>
      <p className="relative text-lg md:text-xl text-blue-200/80 font-light tracking-wide max-w-2xl mx-auto mb-4">
        A showcase of the elite champions.
      </p>

      {/* Admin Link (Subtle) */}
      <Link
        to="/admin"
        className="absolute top-4 right-4 text-xs text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors cursor-pointer"
      >
        Admin
      </Link>
    </header>
  );
};

export default Header;
