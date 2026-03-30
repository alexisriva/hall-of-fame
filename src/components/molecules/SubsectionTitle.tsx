import type { FC, ReactNode } from "react";

interface SubsectionTitleProps {
  title: string;
  icon: ReactNode;
}

const SubsectionTitle: FC<SubsectionTitleProps> = ({ title, icon }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#b22200] text-white text-sm leading-none shrink-0">
      {icon}
    </div>
    <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
  </div>
);

export default SubsectionTitle;
