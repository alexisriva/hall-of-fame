import type { Pokemon } from "pokenode-ts";

const API_STAT_MAP: Record<string, keyof Stats> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spa",
  "special-defense": "spd",
  speed: "spe",
};

export const reduceStats = (data: Pokemon | undefined) => {
  return data
    ? data.stats.reduce(
        (acc, s) => {
          const key = API_STAT_MAP[s.stat.name];
          if (key) acc[key] = s.base_stat;
          return acc;
        },
        { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } as Stats,
      )
    : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
};
