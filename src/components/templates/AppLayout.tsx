import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../organisms/Sidebar";
import TopNav from "../organisms/TopNav";
import { SiGithub } from "react-icons/si";
import avatar from "../../assets/avatar.png";

const AppLayout: FC = () => (
  <div className="flex flex-col md:flex-row h-screen overflow-hidden text-white bg-[#0F1115]">
    <TopNav />
    <Sidebar />
    <main className="flex-1 overflow-y-auto flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="flex justify-center gap-3 items-center text-xs py-8 tracking-widest text-white z-10 relative">
        <p className="opacity-40">
          Alexis Rivadeneira © {new Date().getFullYear()}
        </p>
        <div className="flex gap-2">
          <a
            href="https://alexisrivadeneira.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-colors text-sm font-medium uppercase tracking-wider flex items-center gap-2"
          >
            <img
              src={avatar}
              alt="Alexis Rivadeneira"
              title="Alexis Rivadeneira"
              style={{ width: 18, height: 18 }}
              className="rounded-full"
            />
          </a>
          <a
            href="https://github.com/alexisriva/hall-of-fame"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white hover:scale-110 transition-colors text-sm font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <SiGithub size={18} />
          </a>
        </div>
      </footer>
    </main>
  </div>
);

export default AppLayout;
