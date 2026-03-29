import type { FC, ReactNode } from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  icon,
  fullWidth = false,
  disabled = false,
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const spring = "hover:scale-[1.03] active:scale-[0.97]";
  const style = {
    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
  };

  const variants = {
    primary:
      "bg-[#b22200] text-white px-5 py-2.5 shadow-[0_0_0_1.5px_rgba(255,120,80,0.25)_inset] hover:bg-[#c82500]",
    secondary:
      "bg-[#2a375e] text-[#dbe1ff] px-5 py-2.5 hover:bg-[#3a4a70]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[base, spring, variants[variant], fullWidth ? "w-full" : ""].join(" ")}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
