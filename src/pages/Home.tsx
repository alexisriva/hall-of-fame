import { Link } from "react-router-dom";
import { usePokemonTeam } from "../hooks/usePokemonTeam";
import TeamGrid from "../components/TeamGrid";

const Home = () => {
  const { team, loading } = usePokemonTeam();

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white max-w-5xl mx-auto w-full">
      <header className="pt-20 pb-12 text-center relative z-10 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

        <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">
          HALL OF FAME
        </h1>
        <p className="relative text-xl md:text-2xl text-blue-200/80 font-light tracking-wide max-w-2xl mx-auto mb-8">
          A showcase of the elite champions.
        </p>

        {/* Admin Link (Subtle) */}
        <Link
          to="/admin"
          className="absolute top-4 right-4 text-xs text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors cursor-pointer"
        >
          Admin
        </Link>
      </header>

      <main className="relative z-10 pb-24 px-4">
        {loading && team.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
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
