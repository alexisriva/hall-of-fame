import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../organisms/Sidebar";
import TopNav from "../organisms/TopNav";
import Footer from "../organisms/Footer";

const AppLayout: FC = () => (
  <div className="flex flex-col md:flex-row h-screen overflow-hidden text-white bg-[#0F1115]">
    <TopNav />
    <Sidebar />
    <main className="flex-1 overflow-y-auto flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </main>
  </div>
);

export default AppLayout;
