import type { FC, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({ content, children }) => (
  <div className="relative group/tooltip">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150">
      <div className="bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl whitespace-nowrap">
        {content}
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-white/10" />
    </div>
  </div>
);

export default Tooltip;
