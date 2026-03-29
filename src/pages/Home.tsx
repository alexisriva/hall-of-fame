import type { FC } from "react";
import { useGameStore } from "../store/gameStore";
import TypeIcon from "../components/atoms/TypeIcon";

const Home: FC = () => {
  const builds = useGameStore((s) => s.builds);
  const teams = useGameStore((s) => s.teams);

  const totalTeams = teams.length;

  // Count how many teams each build appears in
  const buildUsage = new Map<string, number>();
  for (const team of teams) {
    for (const buildId of team.pokemon) {
      buildUsage.set(buildId, (buildUsage.get(buildId) ?? 0) + 1);
    }
  }

  // Per species, keep only the build with the highest usage count
  const speciesBest = new Map<string, { build: PokemonBuild; count: number }>();
  for (const build of builds) {
    const species = build.species?.name;
    if (!species) continue;
    const count = buildUsage.get(build.id) ?? 0;
    const existing = speciesBest.get(species);
    if (!existing || count > existing.count) {
      speciesBest.set(species, { build, count });
    }
  }

  // Sort desc by usage, exclude unused, cap at 6
  const hallOfFame = [...speciesBest.values()]
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const isEmpty = hallOfFame.length === 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-white font-bold text-3xl tracking-tight">
          Hall of Fame
        </h1>
        <p className="text-white/30 text-sm">
          The 6 most-used Pokémon across all your teams, one per species.
          {totalTeams > 0 && (
            <span className="ml-1 text-white/20">
              ({totalTeams} team{totalTeams !== 1 ? "s" : ""} recorded)
            </span>
          )}
        </p>
      </div>

      {/* Grid */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 py-24 text-center">
          <p className="text-white/30 font-semibold text-base">
            No hall of fame yet.
          </p>
          <p className="text-white/20 text-sm max-w-xs">
            Add Pokémon builds to your teams in the Team Hub to see them
            ranked here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {hallOfFame.map(({ build, count }) => {
            const usagePct =
              totalTeams > 0 ? Math.round((count / totalTeams) * 100) : 0;
            const types = build.species?.types ?? [];
            const sprite = build.species?.sprite;

            return (
              <div
                key={build.id}
                className="relative overflow-hidden rounded-2xl bg-[#161C29] px-5 pt-5 pb-4 flex flex-col gap-3 min-h-[200px]"
                style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.08)" }}
              >
                {/* Sprite top-left */}
                {sprite && (
                  <img
                    src={sprite}
                    alt={build.species?.name}
                    className="w-20 h-20 object-contain pointer-events-none -mt-1 -ml-1"
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
                    {build.teraType && (
                      <TypeIcon type={build.teraType} size={28} tera />
                    )}
                  </div>
                )}

                {/* Nature + Item */}
                <div className="flex flex-col gap-0.5 mt-auto">
                  <span className="text-white/30 text-xs">
                    {build.nature} · {build.item || "No item"}
                  </span>
                </div>

                {/* Usage pill */}
                <div className="flex">
                  <span className="bg-[#b22200]/20 text-[#b22200] text-xs font-semibold px-2.5 py-0.5 rounded-full tabular-nums">
                    {usagePct}% · {count}/{totalTeams} teams
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
