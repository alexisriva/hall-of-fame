import type { FC } from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

const Loading: FC<LoadingProps> = ({ size = "md" }) => (
  <div
    className={`${sizeMap[size]} animate-spin rounded-full border-white/15 border-t-[#b22200]`}
  />
);

export default Loading;
