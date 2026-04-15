import type { FC } from "react";
import TypeIcon from "../atoms/TypeIcon";
import StatsViewer from "./StatsViewer";
import megaIcon from "../../assets/mega.png";
import gmaxIcon from "../../assets/gmax.png";

interface HallOfFamePokemonCardProps {
  build: PokemonBuild;
  count?: number;
  totalTeams?: number;
}

const HallOfFamePokemonCard: FC<HallOfFamePokemonCardProps> = ({
  build,
  count,
  totalTeams,
}) => {
  const usagePct =
    count !== undefined && totalTeams && totalTeams > 0
      ? Math.round((count / totalTeams) * 100)
      : null;
  const types = build.species?.types ?? [];
  const sprite = build.species?.sprite;

  const isMega = build.species?.form?.toLowerCase().endsWith("-mega");
  const isGigantamax = build.species?.form?.toLowerCase().endsWith("-gmax");

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#161C29] px-5 pt-5 pb-4 flex flex-col gap-3 min-h-[200px]"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
    >
      {/* Mega/Gmax Indicator */}
      {(isMega || isGigantamax) && (
        <div className="absolute top-4 right-4 z-20">
          {isMega && (
            <img
              src={megaIcon}
              alt="Mega"
              width={28}
              className="drop-shadow-md"
            />
          )}
          {isGigantamax && (
            <img
              src={gmaxIcon}
              alt="Gmax"
              width={28}
              className="drop-shadow-md"
            />
          )}
        </div>
      )}

      {/* Sprite top-left */}
      {sprite && (
        <img
          src={sprite}
          alt={build.species?.name}
          className="w-32 h-32 object-contain pointer-events-none -mt-1 -ml-1"
        />
      )}

      {/* Build name + species */}
      <div className="flex flex-col gap-0.5">
        <span className="text-white font-bold text-base leading-tight">
          {build.name}
        </span>
        <span className="text-white/30 text-xs capitalize">
          {build.species?.name ?? "—"}
        </span>
      </div>

      {/* Type icons */}
      {types.length > 0 && (
        <div className="flex items-center gap-1.5">
          {types.map((type) => (
            <TypeIcon key={type} type={type} />
          ))}
          {build.teraType && <TypeIcon type={build.teraType} size={28} tera />}
        </div>
      )}

      {/* Nature + Item */}
      <div className="flex flex-col gap-0.5 mt-auto">
        <span className="text-white/30 text-xs">
          {build.nature} · {build.item || "No item"}
        </span>
      </div>

      {/* Stats chart */}
      {build.species && (
        <div className="w-full pointer-events-none">
          <StatsViewer
            baseStats={build.species.baseStats}
            sps={build.sps}
            nature={build.nature}
            variant="mini"
          />
        </div>
      )}

      {/* Usage pill */}
      {usagePct !== null && (
        <div className="flex">
          <span className="bg-[#b22200]/20 text-[#b22200] text-xs font-semibold px-2.5 py-0.5 rounded-full tabular-nums">
            {usagePct}% · {count}/{totalTeams} teams
          </span>
        </div>
      )}
    </div>
  );
};

export default HallOfFamePokemonCard;
