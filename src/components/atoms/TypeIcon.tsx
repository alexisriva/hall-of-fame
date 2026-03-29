import type { FC } from "react";

const typeIcons = import.meta.glob("../../assets/types/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const teraIcons = import.meta.glob("../../assets/tera-types/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

interface TypeIconProps {
  type: string;
  tera?: boolean;
  size?: number;
}

const TypeIcon: FC<TypeIconProps> = ({ type, tera = false, size = 20 }) => {
  const src = tera
    ? teraIcons[`../../assets/tera-types/tera-${type}.png`]
    : typeIcons[`../../assets/types/${type}.png`];

  if (!src) return null;

  return (
    <img
      src={src}
      alt={tera ? `Tera ${type}` : type}
      title={tera ? `Tera Type: ${type}` : type}
      style={{ width: size, height: size }}
      className={tera ? "" : "rounded-full"}
    />
  );
};

export default TypeIcon;
