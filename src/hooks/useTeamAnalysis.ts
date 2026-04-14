import { useMemo } from "react";
import { ALL_TYPES, getDefensiveMultiplier } from "../utils/typeChart";

export type MultiplierBreakdown = {
  immune: number;       // M = 0
  doubleResist: number; // M = 0.25
  resist: number;       // M = 0.5
  neutral: number;      // M = 1
  weak: number;         // M = 2
  doubleWeak: number;   // M = 4
};

export type TypeCategory = "weakness" | "resist";

export type TypeEntry = {
  type: string;
  /** W_t = Σ M(p_i, t) — sum of defensive multipliers across all members */
  score: number;
  /** Neutral baseline = number of members with species data (all 1x) */
  neutral: number;
  category: TypeCategory;
  severe: boolean;  // weakness: score >= neutral + 2
  caution: boolean; // weakness: score > neutral && score < neutral + 2
  breakdown: MultiplierBreakdown;
};

export type TeamAnalysis = {
  /** Union of all member species types — represents STAB coverage. */
  coverage: string[];
  /** All types with W_t >= 5, sorted by score descending. */
  typeEntries: TypeEntry[];
};

export function useTeamAnalysis(members: PokemonBuild[]): TeamAnalysis {
  return useMemo(() => {
    const coverage = [
      ...new Set(members.flatMap((m) => m.species?.types ?? [])),
    ];

    const membersWithTypes = members.filter((m) => m.species?.types?.length);
    const neutral = membersWithTypes.length;
    const typeEntries: TypeEntry[] = [];

    for (const attackType of ALL_TYPES) {
      const breakdown: MultiplierBreakdown = {
        immune: 0, doubleResist: 0, resist: 0,
        neutral: 0, weak: 0, doubleWeak: 0,
      };

      // W_t = Σ M(p_i, t)
      let score = 0;
      for (const member of membersWithTypes) {
        const m = getDefensiveMultiplier(member.species!.types, attackType);
        score += m;
        if (m === 0)         breakdown.immune++;
        else if (m === 0.25) breakdown.doubleResist++;
        else if (m === 0.5)  breakdown.resist++;
        else if (m === 1)    breakdown.neutral++;
        else if (m === 2)    breakdown.weak++;
        else if (m === 4)    breakdown.doubleWeak++;
      }

      const isWeakness = score > neutral;
      const isResist = score <= 5;
      if (!isWeakness && !isResist) continue;

      const category: TypeCategory = isWeakness ? "weakness" : "resist";

      typeEntries.push({
        type: attackType,
        score,
        neutral,
        category,
        severe: isWeakness && score >= neutral + 2,
        caution: isWeakness && score < neutral + 2,
        breakdown,
      });
    }

    typeEntries.sort((a, b) => b.score - a.score);

    return { coverage, typeEntries };
  }, [members]);
}
