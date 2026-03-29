import { useMemo } from "react";

const BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

export const usePokemonItemSprite = (itemName: string) => {
  return useMemo(() => {
    if (!itemName) return null;

    // Standardize input: "Rocky Helmet" -> "rocky-helmet"
    const slug = itemName
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-"); // Replaces spaces or underscores with hyphens

    return `${BASE_URL}/${slug}.png`;
  }, [itemName]);
};
