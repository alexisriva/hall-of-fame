import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

const defaultStats: Stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

export const createEmptyBuild = (species: string): PokemonBuild => ({
  id: uuidv4(),
  name: species,
  isShiny: false,
  item: "",
  ability: "",
  nature: "Adamant",
  moves: ["", "", "", ""],
  sps: { ...defaultStats },
});

interface GameStore {
  builds: PokemonBuild[];
  teams: PokemonTeam[];
  teamCounter: number;
  battleRecords: BattleRecord[];

  // Build actions
  addBuild: (build: PokemonBuild) => void;
  updateBuild: (buildId: string, build: PokemonBuild) => void;
  deleteBuild: (buildId: string) => void;

  // Team actions
  addTeam: (team: Omit<PokemonTeam, "id">) => void;
  updateTeam: (teamId: string, updates: Partial<PokemonTeam>) => void;
  deleteTeam: (teamId: string) => void;

  // Battle Record actions
  addBattleRecord: (record: Omit<BattleRecord, "id">) => void;
  updateBattleRecord: (id: string, updates: Partial<BattleRecord>) => void;
  deleteBattleRecord: (id: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      builds: [],
      teams: [],
      teamCounter: 1,
      battleRecords: [],

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
        set((state) => ({
          teams: [...state.teams, { ...team, id: String(state.teamCounter) }],
          teamCounter: state.teamCounter + 1,
        })),

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

      addBattleRecord: (record) =>
        set((state) => ({
          battleRecords: [
            ...state.battleRecords,
            { ...record, id: uuidv4() },
          ],
        })),

      updateBattleRecord: (id, updates) =>
        set((state) => ({
          battleRecords: state.battleRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      deleteBattleRecord: (id) =>
        set((state) => ({
          battleRecords: state.battleRecords.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "hall-of-fame-storage",
    },
  ),
);
