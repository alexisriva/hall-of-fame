import type { FC } from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4 border-t-2 border-b-2",
  md: "w-8 h-8 border-t-2 border-b-2",
  lg: "w-12 h-12 border-t-[3px] border-b-[3px]",
};

const Loading: FC<LoadingProps> = ({ size = "md" }) => (
  <div
    className={`${sizeMap[size]} animate-spin rounded-full border-[#b22200]`}
  />
);

export default Loading;
