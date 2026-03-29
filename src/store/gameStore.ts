import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

const defaultStats: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const defaultIvs: Stats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

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

interface GameStore {
  builds: PokemonBuild[];
  teams: PokemonTeam[];

  // Build actions
  addBuild: (build: PokemonBuild) => void;
  updateBuild: (buildId: string, build: PokemonBuild) => void;
  deleteBuild: (buildId: string) => void;

  // Team actions
  addTeam: (team: PokemonTeam) => void;
  updateTeam: (teamId: string, updates: Partial<PokemonTeam>) => void;
  deleteTeam: (teamId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      builds: [],
      teams: [],

      addBuild: (build) =>
        set((state) => ({ builds: [...state.builds, build] })),

      updateBuild: (buildId, build) =>
        set((state) => ({
          builds: state.builds.map((b) => (b.id === buildId ? build : b)),
        })),

      deleteBuild: (buildId) =>
        set((state) => ({
          builds: state.builds.filter((b) => b.id !== buildId),
          // Remove this build ID from any team that references it
          teams: state.teams.map((t) => ({
            ...t,
            pokemon: t.pokemon.filter((id) => id !== buildId),
          })),
        })),

      addTeam: (team) =>
        set((state) => ({ teams: [...state.teams, team] })),

      updateTeam: (teamId, updates) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, ...updates } : t,
          ),
        })),

      deleteTeam: (teamId) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== teamId),
        })),
    }),
    {
      name: "hall-of-fame-storage",
    },
  ),
);
