import { useQueries } from "@tanstack/react-query";
import { pokemonQueryOptions } from "./usePokemonData";
import { reduceStats } from "../utils/statsReducer";
import { NATURES, TYPES } from "../utils/constants";

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Picked once at module-load time — stable for the session, fresh on every page reload
const pickRandom6 = (): number[] => {
  const pool = Array.from({ length: 151 }, (_, i) => i + 1);
  const picks: number[] = [];
  while (picks.length < 6) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
};

const RANDOM_IDS = pickRandom6();
const RANDOM_NATURES = RANDOM_IDS.map(() => pick(NATURES));
const RANDOM_TERA_TYPES = RANDOM_IDS.map(() => pick(Object.keys(TYPES)));

export const useRandomHallOfFame = (enabled: boolean) => {
  const results = useQueries({
    queries: RANDOM_IDS.map((id) => ({
      ...pokemonQueryOptions(String(id)),
      enabled,
    })),
  });

  const isLoading = enabled && results.some((r) => r.isPending);

  const builds: PokemonBuild[] = results
    .filter((r) => r.data)
    .map((r, i) => {
      const data = r.data!;
      return {
        id: String(data.id),
        name: data.name,
        species: {
          name: data.species.name,
          form: data.name,
          sprite:
            data.sprites.other?.["official-artwork"]?.front_default ||
            data.sprites.front_default ||
            "",
          types: data.types.map((t) => t.type.name),
          baseStats: reduceStats(data),
        },
        isShiny: false,
        item: "",
        ability: "",
        nature: RANDOM_NATURES[i],
        teraType: RANDOM_TERA_TYPES[i],
        moves: ["", "", "", ""] as [string, string, string, string],
        sps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      };
    });

  return { builds, isLoading };
};
