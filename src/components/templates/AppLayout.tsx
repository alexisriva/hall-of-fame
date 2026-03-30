import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../organisms/Sidebar";
import TopNav from "../organisms/TopNav";

const AppLayout: FC = () => (
  <div className="flex flex-col md:flex-row h-screen overflow-hidden text-white bg-[#0F1115]">
    <TopNav />
    <Sidebar />
    <main className="flex-1 overflow-y-auto flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="text-center py-8 opacity-40 tracking-widest text-white z-10 relative">
        <p>Alexis Rivadeneira © 2026</p>
      </footer>
    </main>
  </div>
);

export default AppLayout;
