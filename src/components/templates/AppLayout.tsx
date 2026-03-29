import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../organisms/Sidebar";

const AppLayout: FC = () => (
  <div className="flex h-screen overflow-hidden text-white bg-[#0F1115]">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
