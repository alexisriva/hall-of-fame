import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";

const gens = new Generations(Dex);
export const gen9 = gens.get(9);

export interface ShowdownPokemon {
  id: string;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: string[];
  spriteUrl: string;
}

/**
 * Returns a Pokémon Showdown sprite URL based on species ID and shiny flag.
 * Uses play.pokemonshowdown.com standard assets.
 */
export function getShowdownSpriteUrl(name: string, isShiny = false): string {
  // Safe default: return static dex png. 
  // Animated gifs can sometimes fail to load for newer gen custom forms, 
  // so static dex images are extremely reliable and fast.
  const folder = isShiny ? "dex-shiny" : "dex";
  let filename = name.toLowerCase();
  if (filename.endsWith("-mega-x")) {
    filename = filename.replace("-mega-x", "-megax");
  } else if (filename.endsWith("-mega-y")) {
    filename = filename.replace("-mega-y", "-megay");
  }
  filename = filename.replace(/[^a-z0-9-]/g, "");
  return `https://play.pokemonshowdown.com/sprites/${folder}/${filename}.png`;
}

/**
 * Synchronously retrieves Gen 9 Pokémon data from the Showdown engine by name or ID.
 */
export function getPokemonShowdownData(nameOrId: string, isShiny = false): ShowdownPokemon | null {
  const species = Dex.species.get(nameOrId);
  if (!species || !species.exists) return null;

  return {
    id: species.id,
    name: species.name,
    types: species.types,
    baseStats: {
      hp: species.baseStats.hp,
      atk: species.baseStats.atk,
      def: species.baseStats.def,
      spa: species.baseStats.spa,
      spd: species.baseStats.spd,
      spe: species.baseStats.spe,
    },
    abilities: Object.values(species.abilities).filter(Boolean) as string[],
    spriteUrl: getShowdownSpriteUrl(species.name, isShiny),
  };
}

/**
 * Performs a synchronous fuzzy/prefix search of all Gen 9 Pokémon for autocomplete input.
 */
export function searchPokemonShowdown(query: string): ShowdownPokemon[] {
  const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!q) return [];

  const results: ShowdownPokemon[] = [];
  
  for (const species of Dex.species.all()) {
    // Only return standard, past fully coded Showdown forms, or Megas (including custom ones like Meganium-Mega)
    if (species.isNonstandard && species.isNonstandard !== "Past" && !species.isMega) continue;

    const matchesQuery = 
      species.id.includes(q) || 
      species.name.toLowerCase().includes(query.toLowerCase());

    if (matchesQuery) {
      results.push({
        id: species.id,
        name: species.name,
        types: species.types,
        baseStats: species.baseStats,
        abilities: Object.values(species.abilities).filter(Boolean) as string[],
        spriteUrl: getShowdownSpriteUrl(species.name),
      });
      // Cap results for UI responsiveness
      if (results.length >= 15) break;
    }
  }

  return results;
}

/**
 * Safely handles image loading errors by falling back to base species or standard placeholders.
 */
export function handlePokemonSpriteError(
  e: { currentTarget: HTMLImageElement },
  name: string
): void {
  const img = e.currentTarget;
  const lowerName = name.toLowerCase();

  // Try 1: If it's a Mega, Gigantamax or a special form, fall back to its base form Showdown sprite
  if (
    lowerName.includes("-mega") ||
    lowerName.includes("-gmax") ||
    lowerName.includes("-alola") ||
    lowerName.includes("-galar") ||
    lowerName.includes("-hisui")
  ) {
    const baseName = name.split("-")[0];
    const newSrc = `https://play.pokemonshowdown.com/sprites/dex/${baseName.toLowerCase()}.png`;
    if (img.src !== newSrc) {
      img.src = newSrc;
      return;
    }
  }

  // Try 2: Fallback to a standard PokeAPI items Poke Ball icon
  const pokeapiFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png`;
  if (img.src !== pokeapiFallback) {
    img.src = pokeapiFallback;
  }
}

export interface ShowdownMove {
  name: string;
  category: "Physical" | "Special" | "Status";
  basePower: number;
  type: string;
  desc?: string;
  shortDesc?: string;
}

/**
 * Retrieves Move details synchronously from the Showdown Dex.
 */
export function getMoveShowdownData(nameOrId: string): ShowdownMove | null {
  if (!nameOrId) return null;
  const move = Dex.moves.get(nameOrId);
  if (!move || !move.exists) return null;

  return {
    name: move.name,
    category: move.category as "Physical" | "Special" | "Status",
    basePower: move.basePower,
    type: move.type,
    desc: move.desc,
    shortDesc: move.shortDesc,
  };
}

/**
 * Asynchronously retrieves Gen 9 learnset for a species.
 */
export async function getPokemonLearnset(nameOrId: string): Promise<string[]> {
  if (!nameOrId) return [];
  const species = Dex.species.get(nameOrId);
  if (!species || !species.exists) return [];

  let learnsetData = await gen9.learnsets.get(species.id);
  // Fall back to base species if learnset is empty/missing
  if ((!learnsetData || !learnsetData.learnset) && species.baseSpecies) {
    const baseId = species.baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, "");
    learnsetData = await gen9.learnsets.get(baseId);
  }

  if (!learnsetData || !learnsetData.learnset) return [];

  const movesList: string[] = [];
  for (const moveId of Object.keys(learnsetData.learnset)) {
    const move = gen9.moves.get(moveId);
    if (move && move.exists) {
      movesList.push(move.name);
    }
  }

  // Sort alphabetically for clean UI presentation
  return movesList.sort();
}


