export const capitalize = (s: string): string => {
  if (!s) return "";

  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
