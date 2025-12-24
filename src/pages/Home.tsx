import { useState, type FC } from "react";
import Header from "../components/Header";
import TeamGrid from "../components/TeamGrid";
import PcGrid from "../components/PcGrid";
import AddPokemonModal from "../components/AddPokemonModal";
import { useGameStore } from "../store/gameStore";

const Home: FC = () => {
  const { party, pc, addPokemon } = useGameStore();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-amber-500 selection:text-white w-full pb-20">
      <Header />

      <AddPokemonModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={addPokemon}
      />

      <main className="relative z-10 px-4 space-y-12">
        {/* Section A: Party */}
        <section>
          <div className="max-w-[1600px] mx-auto px-4 mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-amber-400">
              Current Party ({party.length}/6)
            </h2>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 rounded-lg text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 transform hover:-translate-y-0.5"
            >
              + Add Member
            </button>
          </div>

          {party.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl max-w-4xl mx-auto bg-white/5">
              <p className="text-gray-400 mb-2 text-xl font-bold">
                Your party is empty.
              </p>
              <p className="text-gray-500 text-sm">
                Click "Add Member" to draft your first pokemon!
              </p>
            </div>
          ) : (
            <TeamGrid members={party} />
          )}
        </section>

        {/* Section B: PC */}
        <section className="max-w-[1600px] mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-400 mb-4">
            PC Box ({pc.length}/10)
          </h2>
          <PcGrid members={pc} limit={10} />
        </section>
      </main>

      <footer className="text-center mt-20 pb-8 opacity-40 text-xs tracking-widest text-white z-10 relative">
        <p>LOCAL DATA STORAGE • POKEAPI</p>
      </footer>
    </div>
  );
};

export default Home;
