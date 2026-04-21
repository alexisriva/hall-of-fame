import { type Pokemon } from "pokenode-ts";
import { api } from "../hooks/usePokemonData";

export const capitalize = (s: string): string => {
  if (!s) return "";

  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const fetchBulbagardenHomeSprite = async (
  id: number,
  isShiny = false,
  formIndicator = "",
): Promise<string | null> => {
  const padId = String(id).padStart(4, "0");
  const shinySuffix = isShiny ? "_s" : "";
  // Example: HOME0154M.png or HOME0154_s.png
  const fileName = `HOME${padId}${formIndicator}${shinySuffix}.png`;
  const url = `https://archives.bulbagarden.net/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=url&format=json&origin=*`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;

    return pages[pageId].imageinfo?.[0]?.url || null;
  } catch (error) {
    console.error("Error fetching Bulbagarden sprite:", error);
    return null;
  }
};

export const resolveBestSprite = async (
  pokemon: Pokemon | undefined,
  isShiny = false,
): Promise<string> => {
  if (!pokemon) return "";

  // 1. Try PokéAPI HOME
  const homeSprite = isShiny
    ? pokemon.sprites.other?.home?.front_shiny
    : pokemon.sprites.other?.home?.front_default;
  if (homeSprite) return homeSprite;

  // 2. Try Bulbagarden
  try {
    let formIndicator = "";
    if (pokemon.name.includes("-mega")) formIndicator = "M";
    if (pokemon.name.includes("-gmax")) formIndicator = "G";

    // We need the species ID for the Bulbagarden filename (e.g. Meganium Mega is still 0154)
    // Most forms have IDs > 10000, so we fetch the species to get the base ID
    let speciesId = pokemon.id;
    if (speciesId > 10000) {
      const species = await api.getPokemonSpeciesByName(pokemon.species.name);
      speciesId = species.id;
    }

    const bulbaUrl = await fetchBulbagardenHomeSprite(
      speciesId,
      isShiny,
      formIndicator,
    );
    if (bulbaUrl) return bulbaUrl;
  } catch (e) {
    console.warn("Failed to resolve species ID for Bulbagarden:", e);
  }

  return pokemon.sprites.front_default || "";
};
