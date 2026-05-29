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
export function getShowdownSpriteUrl(id: string, isShiny = false): string {
  // Safe default: return static dex png. 
  // Animated gifs can sometimes fail to load for newer gen custom forms, 
  // so static dex images are extremely reliable and fast.
  const folder = isShiny ? "dex-shiny" : "dex";
  return `https://play.pokemonshowdown.com/sprites/${folder}/${id}.png`;
}

/**
 * Synchronously retrieves Gen 9 Pokémon data from the Showdown engine by name or ID.
 */
export function getPokemonShowdownData(nameOrId: string, isShiny = false): ShowdownPokemon | null {
  const species = gen9.species.get(nameOrId);
  if (!species) return null;

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
    spriteUrl: getShowdownSpriteUrl(species.id, isShiny),
  };
}

/**
 * Performs a synchronous fuzzy/prefix search of all Gen 9 Pokémon for autocomplete input.
 */
export function searchPokemonShowdown(query: string): ShowdownPokemon[] {
  const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!q) return [];

  const results: ShowdownPokemon[] = [];
  
  for (const species of gen9.species) {
    // Only return fully evolved, legal, or standard species/forms (exclude weird custom or placeholder forms)
    if (species.isNonstandard) continue;

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
        spriteUrl: getShowdownSpriteUrl(species.id),
      });
      // Cap results for UI responsiveness
      if (results.length >= 15) break;
    }
  }

  return results;
}
