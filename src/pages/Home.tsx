import type { FC } from "react";
import HallOfFamePokemonCard from "../components/molecules/HallOfFamePokemonCard";
import Loading from "../components/atoms/Loading";
import { useGameStore } from "../store/gameStore";
import { useRandomHallOfFame } from "../hooks/useRandomHallOfFame";
import logo from "../assets/logo.png";

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

  const isNewUser = teams.length === 0;
  const { builds: randomBuilds, isLoading: randomLoading } =
    useRandomHallOfFame(isNewUser);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-10 flex flex-col gap-6 md:gap-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <img src={logo} width={36} alt="Logo" className="hidden md:block" />
          <h1 className="text-white font-bold text-2xl md:text-3xl tracking-tight">
            Hall of Fame
          </h1>
        </div>
        <p className="text-white/30 text-sm">
          The 6 most-used Pokémon across all your teams.
          {totalTeams > 0 && (
            <span className="ml-1 text-white/20">
              ({totalTeams} team{totalTeams !== 1 ? "s" : ""} recorded)
            </span>
          )}
        </p>
      </div>

      {/* Grid */}
      {isNewUser ? (
        <div className="flex flex-col gap-4">
          {randomLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loading size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              {randomBuilds.map((build) => (
                <HallOfFamePokemonCard key={build.id} build={build} />
              ))}
            </div>
          )}
          <p className="text-white text-xs text-center">
            This is a randomized Hall of Fame. It will be replaced once you
            start logging your own teams.
          </p>
        </div>
      ) : hallOfFame.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 py-24 text-center">
          <p className="text-white/30 font-semibold text-base">
            No hall of fame yet.
          </p>
          <p className="text-white/20 text-sm max-w-xs">
            Add Pokémon builds to your teams in the Team Hub to see them ranked
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {hallOfFame.map(({ build, count }) => (
            <HallOfFamePokemonCard
              key={build.id}
              build={build}
              count={count}
              totalTeams={totalTeams}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
