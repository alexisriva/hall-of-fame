import { usePokemonTeam } from "../hooks/usePokemonTeam";
import TeamGrid from "../components/TeamGrid";
import Header from "../components/Header";

const Home = () => {
  const { team, loading } = usePokemonTeam();

  return (
    <div className="min-h-screen text-white font-sans selection:bg-amber-500 selection:text-white w-full">
      <Header />

      <main className="relative z-10 pb-24 px-4">
        {loading && team.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <TeamGrid members={team} />
        )}

        {team.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-10 p-10 border border-dashed border-gray-700 rounded-xl max-w-lg mx-auto bg-black/20">
            <p className="mb-2 text-lg">The Hall is empty.</p>
            <p className="text-sm">No Pokemon found in the database.</p>
          </div>
        )}
      </main>

      <footer className="text-center pb-8 opacity-40 text-xs tracking-widest text-white z-10 relative">
        <p>POWERED BY POKEAPI & FIREBASE</p>
      </footer>
    </div>
  );
};

export default Home;
