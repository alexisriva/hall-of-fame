import type { FC } from "react";
import {
  HiOutlineShieldExclamation,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { TbSword } from "react-icons/tb";
import { getDefensiveMultiplier } from "../../utils/typeChart";
import TypeIcon from "../atoms/TypeIcon";

interface PokemonGridMember {
  id: string;
  name: string;
  types: string[];
  spriteUrl: string;
}

interface MatchupGridProps {
  playerActive: PokemonGridMember[];
  opponentActive: PokemonGridMember[];
}

const MatchupGrid: FC<MatchupGridProps> = ({
  playerActive,
  opponentActive,
}) => {
  const hasDuo = playerActive.length > 0 && opponentActive.length > 0;

  if (!hasDuo) {
    return (
      <div className="py-12 text-center text-white/20 text-sm">
        Select active combatants from both sides to display the matchup matrix.
      </div>
    );
  }

  // Calculate matchup insights for cell
  const getMatchupDetails = (
    attacker: PokemonGridMember,
    defender: PokemonGridMember,
  ) => {
    // 1. Offense: Attacker's STAB types that deal super-effective damage to Defender
    const superEffectiveOffense = attacker.types
      .filter((t) => {
        const mult = getDefensiveMultiplier(defender.types, t);
        return mult > 1; // 2x or 4x
      })
      .map((t) => ({
        type: t,
        multiplier: getDefensiveMultiplier(defender.types, t),
      }));

    // 2. Defense: Defender's STAB types that deal super-effective damage to Attacker
    const superEffectiveDefense = defender.types
      .filter((t) => {
        const mult = getDefensiveMultiplier(attacker.types, t);
        return mult > 1; // 2x or 4x
      })
      .map((t) => ({
        type: t,
        multiplier: getDefensiveMultiplier(attacker.types, t),
      }));

    return {
      offense: superEffectiveOffense,
      defense: superEffectiveDefense,
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Matrix Header info */}
      <div className="flex items-center justify-between text-xs text-white/40 pb-2 border-b border-white/5">
        <span>ACTIVE 2X2 MATCHUP GRID</span>
        <span>STAB ADVANTAGE CHECK</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Top Left Corner */}
              <th className="p-3 text-left text-xs font-bold text-white/30 border-b border-white/5 min-w-[120px]">
                YOUR DUO
              </th>
              {/* Opponent active columns */}
              {opponentActive.map((opp) => (
                <th
                  key={opp.id}
                  className="p-3 text-center border-b border-l border-white/5 min-w-[160px]"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <img
                      src={opp.spriteUrl}
                      alt={opp.name}
                      className="w-12 h-12 object-contain pointer-events-none"
                    />
                    <span className="text-white text-xs font-black capitalize truncate max-w-[120px]">
                      {opp.name}
                    </span>
                    <div className="flex gap-0.5">
                      {opp.types.map((type) => (
                        <TypeIcon key={type} type={type} size={12} />
                      ))}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playerActive.map((pl) => (
              <tr key={pl.id} className="border-b border-white/5">
                {/* Player Row Header */}
                <td className="p-3 text-left border-r border-white/5">
                  <div className="flex items-center gap-2">
                    <img
                      src={pl.spriteUrl}
                      alt={pl.name}
                      className="w-10 h-10 object-contain shrink-0 pointer-events-none"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-xs font-black capitalize truncate">
                        {pl.name}
                      </span>
                      <div className="flex gap-0.5 mt-0.5 shrink-0">
                        {pl.types.map((type) => (
                          <TypeIcon key={type} type={type} size={10} />
                        ))}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Matchup Cells */}
                {opponentActive.map((opp) => {
                  const details = getMatchupDetails(pl, opp);
                  const isOffenseAdvantage = details.offense.length > 0;
                  const isDefenseAdvantage = details.defense.length > 0;

                  return (
                    <td
                      key={opp.id}
                      className={[
                        "p-4 border-l border-white/5 vertical-top text-xs transition-colors",
                        isOffenseAdvantage &&
                          !isDefenseAdvantage &&
                          "bg-emerald-500/1.5",
                        !isOffenseAdvantage &&
                          isDefenseAdvantage &&
                          "bg-[#b22200]/1.5",
                        isOffenseAdvantage &&
                          isDefenseAdvantage &&
                          "bg-amber-500/1.5",
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-2.5">
                        {/* Offense */}
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/30">
                            <TbSword size={12} className="text-emerald-400" />
                            Your Offense vs Opponent
                          </span>
                          {isOffenseAdvantage ? (
                            <div className="flex flex-col gap-1">
                              {details.offense.map((o) => (
                                <div
                                  key={o.type}
                                  className="flex items-center gap-1.5"
                                >
                                  <TypeIcon type={o.type} size={11} />
                                  <span className="text-emerald-400 font-bold">
                                    Deals {o.multiplier}×
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/20 text-[10px]">
                              No type advantage
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 w-full" />

                        {/* Defense */}
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/30">
                            <HiOutlineShieldExclamation
                              size={12}
                              className="text-[#b22200]"
                            />
                            Opponent Offense vs You
                          </span>
                          {isDefenseAdvantage ? (
                            <div className="flex flex-col gap-1">
                              {details.defense.map((d) => (
                                <div
                                  key={d.type}
                                  className="flex items-center gap-1.5"
                                >
                                  <TypeIcon type={d.type} size={11} />
                                  <span className="text-[#b22200] font-bold">
                                    Takes {d.multiplier}×
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-500/60 font-semibold text-[10px]">
                              Resists all STABs
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Notes */}
      <div className="flex gap-2.5 bg-white/1 p-3 rounded-xl border border-white/5">
        <HiOutlineLightBulb
          size={18}
          className="text-amber-400 shrink-0 mt-0.5"
        />
        <p className="text-white/40 text-[11px] font-medium leading-relaxed">
          The grid evaluates **STAB (Same Type Attack Bonus) moves**.
          Super-effective hits (2x/4x) are mapped dynamically. A cell shaded in
          **green** means you threaten them; **red** means they threaten you;
          **orange** means a double-threat slugfest.
        </p>
      </div>
    </div>
  );
};

export default MatchupGrid;
