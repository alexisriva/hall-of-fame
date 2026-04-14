// Mapping Natures to their modifiers
export const NATURE_MODIFIERS: Record<Nature, { plus?: string; minus?: string }> = {
  Adamant: { plus: "attack", minus: "special-attack" },
  Bold: { plus: "defense", minus: "attack" },
  Brave: { plus: "attack", minus: "speed" },
  Calm: { plus: "special-defense", minus: "attack" },
  Careful: { plus: "special-defense", minus: "special-attack" },
  Gentle: { plus: "special-defense", minus: "defense" },
  Hasty: { plus: "speed", minus: "defense" },
  Impish: { plus: "defense", minus: "special-attack" },
  Jolly: { plus: "speed", minus: "special-attack" },
  Lax: { plus: "defense", minus: "special-defense" },
  Lonely: { plus: "attack", minus: "defense" },
  Mild: { plus: "special-attack", minus: "defense" },
  Modest: { plus: "special-attack", minus: "attack" },
  Naive: { plus: "speed", minus: "special-defense" },
  Naughty: { plus: "attack", minus: "special-defense" },
  Quiet: { plus: "special-attack", minus: "speed" },
  Rash: { plus: "special-attack", minus: "special-defense" },
  Relaxed: { plus: "defense", minus: "speed" },
  Sassy: { plus: "special-defense", minus: "speed" },
  Timid: { plus: "speed", minus: "attack" },
  // Neutral natures
  Bashful: {},
  Docile: {},
  Hardy: {},
  Quirky: {},
  Serious: {},
};

interface CalcParams {
  statName: string;
  base: number;
  sp: number;
  nature: Nature;
}

const calculateStat = ({
  statName,
  base,
  sp,
  nature,
}: CalcParams): number => {
  const L = 50;
  const iv = 31;

  // Base calculation shared by HP and others
  // In the new SP system at level 50, 1 SP = 1 real stat point.
  const common = Math.floor(((2 * base + iv) * L) / 100) + sp;

  if (statName === "hp") {
    // Special case for Shedinja would go here if base is 1
    if (base === 1) return 1;
    return common + L + 10;
  }

  // Calculate Nature Modifier
  let modifier = 1.0;
  const mods = NATURE_MODIFIERS[nature];
  if (mods.plus === statName) modifier = 1.1;
  if (mods.minus === statName) modifier = 0.9;

  return Math.floor((common + 5) * modifier);
};

/**
 * Calculates the final Level 50 stats for a Pokemon.
 */
export const calculateFullSpread = (
  baseStats: Stats,
  sps: Stats,
  nature: Nature,
): Stats => {
  const statKeys: (keyof Stats)[] = ["hp", "atk", "def", "spa", "spd", "spe"];

  const finalStats = {} as Stats;

  statKeys.forEach((key) => {
    // Mapping internal short keys to the descriptive names used in calculateStat
    const statMap: Record<keyof Stats, string> = {
      hp: "hp",
      atk: "attack",
      def: "defense",
      spa: "special-attack",
      spd: "special-defense",
      spe: "speed",
    };

    finalStats[key] = calculateStat({
      statName: statMap[key],
      base: baseStats[key],
      sp: sps[key],
      nature: nature,
    });
  });

  return finalStats;
};
