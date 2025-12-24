import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// Default empty stats
const defaultStats: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const defaultIvs: Stats = {
  hp: 31,
  atk: 31,
  def: 31,
  spa: 31,
  spd: 31,
  spe: 31,
};

// Helper to create a fresh build
export const createEmptyBuild = (species: string): PokemonBuild => ({
  id: uuidv4(),
  name: species,
  isShiny: false,
  item: "",
  ability: "",
  nature: "Adamant",
  moves: ["", "", "", ""],
  evs: { ...defaultStats },
  ivs: { ...defaultIvs },
});

// Helper to create a fresh Pokemon
const createPokemon = (species: string): Pokemon => ({
  id: uuidv4(),
  species: species.toLowerCase(),
  activeBuildId: null,
  savedBuilds: [],
});

interface GameStore {
  party: Pokemon[];
  pc: Pokemon[];
  selectedPokemonId: string | null;

  // Actions
  addPokemon: (species?: string) => void;
  selectPokemon: (id: string | null) => void;
  updatePokemon: (id: string, updates: Partial<Pokemon>) => void;
  saveBuild: (pokemonId: string, build: PokemonBuild) => void;
  deleteBuild: (pokemonId: string, buildId: string) => void;
  deletePokemon: (id: string) => void;
  toggleActiveBuildId: (pokemonId: string, buildId: string) => void;
  movePokemon: (id: string, to: "party" | "pc") => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      party: [],
      pc: [],
      selectedPokemonId: null,

      addPokemon: (species = "ditto") => {
        const newMon = createPokemon(species);
        const { party, pc } = get();

        if (party.length < 6) {
          set({ party: [...party, newMon] });
        } else if (pc.length < 10) {
          set({ pc: [...pc, newMon] });
        } else {
          alert("PC is full!");
        }
      },

      selectPokemon: (id) => set({ selectedPokemonId: id }),

      updatePokemon: (id, updates) => {
        set((state) => ({
          party: state.party.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          pc: state.pc.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      saveBuild: (pokemonId, build) => {
        const updateFn = (p: Pokemon) => {
          if (p.id !== pokemonId) return p;

          // Check if updating existing
          const existingIndex = p.savedBuilds.findIndex(
            (b) => b.id === build.id
          );

          if (existingIndex >= 0) {
            const newSaved = [...p.savedBuilds];
            newSaved[existingIndex] = build;
            return { ...p, savedBuilds: newSaved };
          }

          if (p.savedBuilds.length >= 3) {
            alert("Library Full! Delete a build to save a new one.");
            return p;
          }

          // Auto-set as active if it's the first one
          const newActiveId =
            p.savedBuilds.length === 0 ? build.id : p.activeBuildId;

          return {
            ...p,
            activeBuildId: newActiveId,
            savedBuilds: [...p.savedBuilds, build],
          };
        };
        set((state) => ({
          party: state.party.map(updateFn),
          pc: state.pc.map(updateFn),
        }));
      },

      deleteBuild: (pokemonId, buildId) => {
        const updateFn = (p: Pokemon) => {
          if (p.id !== pokemonId) return p;
          return {
            ...p,
            // If deleting the currently equipped build, unequip it
            activeBuildId: p.activeBuildId === buildId ? null : p.activeBuildId,
            savedBuilds: p.savedBuilds.filter((b) => b.id !== buildId),
          };
        };
        set((state) => ({
          party: state.party.map(updateFn),
          pc: state.pc.map(updateFn),
        }));
      },

      deletePokemon: (id) => {
        set((state) => ({
          party: state.party.filter((p) => p.id !== id),
          pc: state.pc.filter((p) => p.id !== id),
          selectedPokemonId:
            state.selectedPokemonId === id ? null : state.selectedPokemonId,
        }));
      },

      toggleActiveBuildId: (pokemonId, buildId) => {
        const updateFn = (p: Pokemon) => {
          if (p.id !== pokemonId) return p;
          return {
            ...p,
            activeBuildId: p.activeBuildId === buildId ? null : buildId,
          };
        };
        set((state) => ({
          party: state.party.map(updateFn),
          pc: state.pc.map(updateFn),
        }));
      },

      movePokemon: (id, to) => {
        // This is a bit complex, strictly implementation based on requirements not fully detailed
        // For now, simpler implementation: just used for adding.
        // If needed later, we can implement drag and drop logic here.
        console.log("Move not implemented yet", id, to);
      },
    }),
    {
      name: "hall-of-fame-storage", // unique name
    }
  )
);
