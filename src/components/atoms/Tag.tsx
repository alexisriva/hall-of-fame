import type { FC } from "react";

export type TagVariant = "default" | "danger" | "info" | "warning" | "success";

interface TagProps {
  label: string;
  variant?: TagVariant;
}

const variantStyles: Record<TagVariant, string> = {
  default: "bg-white/10 text-white/70",
  danger: "bg-[#b22200]/20 text-[#ff6b4a] tracking-widest uppercase",
  info: "bg-[#005ab6]/20 text-[#60a5fa] tracking-widest uppercase",
  warning: "bg-amber-500/20 text-amber-400 tracking-widest uppercase",
  success: "bg-emerald-500/20 text-emerald-400 tracking-widest uppercase",
};

const Tag: FC<TagProps> = ({ label, variant = "default" }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      variantStyles[variant],
    ].join(" ")}
  >
    {label}
  </span>
);

export default Tag;
