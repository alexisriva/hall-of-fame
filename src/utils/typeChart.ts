export const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

export type PokemonType = typeof ALL_TYPES[number];

// attacking type → defending types that take 2x
const SUPER_EFFECTIVE: Record<string, string[]> = {
  normal:   [],
  fire:     ["grass", "ice", "bug", "steel"],
  water:    ["fire", "ground", "rock"],
  electric: ["water", "flying"],
  grass:    ["water", "ground", "rock"],
  ice:      ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison:   ["grass", "fairy"],
  ground:   ["fire", "electric", "poison", "rock", "steel"],
  flying:   ["grass", "fighting", "bug"],
  psychic:  ["fighting", "poison"],
  bug:      ["grass", "psychic", "dark"],
  rock:     ["fire", "ice", "flying", "bug"],
  ghost:    ["psychic", "ghost"],
  dragon:   ["dragon"],
  dark:     ["psychic", "ghost"],
  steel:    ["ice", "rock", "fairy"],
  fairy:    ["fighting", "dragon", "dark"],
};

// attacking type → defending types that take 0.5x
const NOT_VERY_EFFECTIVE: Record<string, string[]> = {
  normal:   ["rock", "steel"],
  fire:     ["fire", "water", "rock", "dragon"],
  water:    ["water", "grass", "dragon"],
  electric: ["electric", "grass", "dragon"],
  grass:    ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  ice:      ["water", "ice", "steel", "fire"],
  fighting: ["poison", "flying", "psychic", "bug", "fairy"],
  poison:   ["poison", "ground", "rock", "ghost"],
  ground:   ["grass", "bug"],
  flying:   ["electric", "rock", "steel"],
  psychic:  ["psychic", "steel"],
  bug:      ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  rock:     ["fighting", "ground", "steel"],
  ghost:    ["dark"],
  dragon:   ["steel"],
  dark:     ["fighting", "dark", "fairy"],
  steel:    ["fire", "water", "electric", "steel"],
  fairy:    ["fire", "poison", "steel"],
};

// attacking type → defending types that take 0x (immune)
const NO_EFFECT: Record<string, string[]> = {
  normal:   ["ghost"],
  electric: ["ground"],
  fighting: ["ghost"],
  poison:   ["steel"],
  ground:   ["flying"],
  psychic:  ["dark"],
  ghost:    ["normal"],
  dragon:   ["fairy"],
};

export function getEffectiveness(attackType: string, defType: string): number {
  const att = attackType.toLowerCase();
  const def = defType.toLowerCase();
  if (NO_EFFECT[att]?.includes(def)) return 0;
  if (SUPER_EFFECTIVE[att]?.includes(def)) return 2;
  if (NOT_VERY_EFFECTIVE[att]?.includes(def)) return 0.5;
  return 1;
}

/** Returns the combined effectiveness multiplier of attackType vs a Pokémon with the given defTypes. */
export function getDefensiveMultiplier(defTypes: string[], attackType: string): number {
  return defTypes.reduce((acc, dt) => acc * getEffectiveness(attackType, dt), 1);
}

/** Returns the list of defending types that take 2x damage from attackType. */
export function getSuperEffectiveTargets(attackType: string): string[] {
  const att = attackType.toLowerCase();
  return SUPER_EFFECTIVE[att] || [];
}

/** Returns all types that resist or are immune to attackType (defending multiplier <= 0.5). */
export function getResistTypes(attackType: string): string[] {
  const att = attackType.toLowerCase();
  const results: string[] = [];
  for (const defType of ALL_TYPES) {
    if (getEffectiveness(att, defType) <= 0.5) {
      results.push(defType);
    }
  }
  return results;
}


