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

interface SwapSelection {
  loc: "party" | "pc";
  index: number;
}

interface GameStore {
  party: (Pokemon | null)[];
  pc: (Pokemon | null)[];
  selectedPokemonId: string | null;
  swapSelection: SwapSelection | null;

  // Actions
  addPokemon: (species?: string) => void;
  selectPokemon: (id: string | null) => void;
  updatePokemon: (id: string, updates: Partial<Pokemon>) => void;
  saveBuild: (pokemonId: string, build: PokemonBuild) => void;
  deleteBuild: (pokemonId: string, buildId: string) => void;
  deletePokemon: (id: string) => void;
  toggleActiveBuildId: (pokemonId: string, buildId: string) => void;

  // Swap Actions
  setSwapSelection: (selection: SwapSelection | null) => void;
  movePokemon: (
    fromLoc: "party" | "pc",
    fromIdx: number,
    toLoc: "party" | "pc",
    toIdx: number
  ) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      party: Array(6).fill(null),
      pc: Array(10).fill(null),
      selectedPokemonId: null,
      swapSelection: null,

      addPokemon: (species = "ditto") => {
        const newMon = createPokemon(species);
        const { party, pc } = get();

        // 1. Try Party
        const emptyPartyIdx = party.findIndex((p) => p === null);
        if (emptyPartyIdx !== -1) {
          const newParty = [...party];
          newParty[emptyPartyIdx] = newMon;
          set({ party: newParty });
          return;
        }

        // 2. Try PC
        const emptyPcIdx = pc.findIndex((p) => p === null);
        if (emptyPcIdx !== -1) {
          const newPc = [...pc];
          newPc[emptyPcIdx] = newMon;
          set({ pc: newPc });
          return;
        }

        alert("Storage is full! Release a Pokemon to catch more.");
      },

      selectPokemon: (id) => set({ selectedPokemonId: id }),

      setSwapSelection: (selection) => set({ swapSelection: selection }),

      movePokemon: (fromLoc, fromIdx, toLoc, toIdx) => {
        const state = get();
        const sourceList =
          fromLoc === "party" ? [...state.party] : [...state.pc];
        const targetList = toLoc === "party" ? [...state.party] : [...state.pc];

        // If defined in same list (and it's the same list instance), be careful
        // Actually, let's keep it simple:
        // 1. Get the items
        const itemA = sourceList[fromIdx];

        // If lists are different, we can just mutate clones and set.
        // If lists are same (e.g. party to party), we need to ensure we are working on the same cloned array.

        if (fromLoc === toLoc) {
          // SWAP INTERNAL
          const list = sourceList; // already cloned above
          const itemB = list[toIdx];

          list[fromIdx] = itemB;
          list[toIdx] = itemA;

          set({ [fromLoc]: list });
        } else {
          // SWAP ACROSS LISTS
          // sourceList is clone of A, targetList is clone of B
          const itemB = targetList[toIdx];

          sourceList[fromIdx] = itemB;
          targetList[toIdx] = itemA;

          set({
            [fromLoc]: sourceList,
            [toLoc]: targetList,
          });
        }

        // Clear selection after move
        set({ swapSelection: null });
      },

      updatePokemon: (id, updates) => {
        const updateList = (list: (Pokemon | null)[]) =>
          list.map((p) => (p && p.id === id ? { ...p, ...updates } : p));

        set((state) => ({
          party: updateList(state.party),
          pc: updateList(state.pc),
        }));
      },

      saveBuild: (pokemonId, build) => {
        const updateFn = (p: Pokemon | null) => {
          if (!p || p.id !== pokemonId) return p;

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
        const updateFn = (p: Pokemon | null) => {
          if (!p || p.id !== pokemonId) return p;
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
        const removeFn = (p: Pokemon | null) => (p && p.id === id ? null : p);

        set((state) => ({
          party: state.party.map(removeFn),
          pc: state.pc.map(removeFn),
          selectedPokemonId:
            state.selectedPokemonId === id ? null : state.selectedPokemonId,
        }));
      },

      toggleActiveBuildId: (pokemonId, buildId) => {
        const updateFn = (p: Pokemon | null) => {
          if (!p || p.id !== pokemonId) return p;
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
    }),
    {
      name: "hall-of-fame-storage", // unique name
    }
  )
);
