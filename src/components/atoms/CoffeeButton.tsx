import type { FC, CSSProperties } from "react";
import { GiCoffeeCup } from "react-icons/gi";

interface Props {
  className?: string;
  style?: CSSProperties;
}

const CoffeeButton: FC<Props> = ({ className, style }: Props) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const spring = "hover:scale-[1.03] active:scale-[0.97]";
  const _style = {
    ...style,
    transition:
      "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
  };

  const primary =
    "bg-[#b22200] text-white px-5 py-2.5 shadow-[0_0_0_1.5px_rgba(255,120,80,0.25)_inset] hover:bg-[#c82500]";

  return (
    <a
      style={_style}
      className={[base, spring, primary, className, "animate-bounce"].join(" ")}
      href="https://ppls.me/kqvTswZRmfMxGKbtqa4V0w"
      target="_blank"
      rel="noopener noreferrer"
    >
      <GiCoffeeCup size={30} />
      Buy me a coffee
    </a>
  );
};

export default CoffeeButton;
