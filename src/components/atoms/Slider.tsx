import type { FC } from "react";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: FC<SliderProps> = ({ min, max, step = 1, value, onChange }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className={[
      "flex-1 h-1.5 rounded-full appearance-none cursor-pointer",
      "bg-white/10",
      "[&::-webkit-slider-thumb]:appearance-none",
      "[&::-webkit-slider-thumb]:w-3.5",
      "[&::-webkit-slider-thumb]:h-3.5",
      "[&::-webkit-slider-thumb]:rounded-full",
      "[&::-webkit-slider-thumb]:bg-[#b22200]",
      "[&::-webkit-slider-thumb]:cursor-pointer",
      "[&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(178,34,0,0.5)]",
      "[&::-moz-range-thumb]:w-3.5",
      "[&::-moz-range-thumb]:h-3.5",
      "[&::-moz-range-thumb]:rounded-full",
      "[&::-moz-range-thumb]:bg-[#b22200]",
      "[&::-moz-range-thumb]:border-none",
      "[&::-moz-range-thumb]:cursor-pointer",
    ].join(" ")}
  />
);

export default Slider;
