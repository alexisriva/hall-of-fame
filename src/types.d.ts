// -- Local Game Types --

type Stats = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

type Nature =
  | "Adamant"
  | "Bashful"
  | "Bold"
  | "Brave"
  | "Calm"
  | "Careful"
  | "Docile"
  | "Gentle"
  | "Hardy"
  | "Hasty"
  | "Impish"
  | "Jolly"
  | "Lax"
  | "Lonely"
  | "Mild"
  | "Modest"
  | "Naive"
  | "Naughty"
  | "Quiet"
  | "Quirky"
  | "Rash"
  | "Relaxed"
  | "Sassy"
  | "Serious"
  | "Timid";

type PokemonBuild = {
  id: string; // unique build ID
  name: string; // build name (e.g. "Sweeper")
  species?: {
    name: string;
    form: string;
    sprite: string;
    types: string[];
    baseStats: Stats;
  };
  isShiny: boolean;
  item: string;
  ability: string;
  nature: Nature;
  moves: [string, string, string, string];
  sps: Stats;
  teraType?: string;
};

type PokemonTeam = {
  id: string;
  regulation: string;
  name: string;
  /** Array of PokemonBuild IDs — resolve against the store's `builds` array */
  pokemon: string[];
  leads?: MatchLead[];
  counters?: MatchCounter[];
  additionalInsights: string;
  wins: number;
  losses: number;
};

type MatchLead = {
  pokemon: PokemonBuild[];
  notes: string;
};

type MatchCounter = {
  pokemon: PokemonBuild;
  notes: string;
};

type TurnAction = {
  actionType: "move" | "switch";
  pokemon: string; // Active species name performing the action
  isPlayer: boolean; // Indicates if it's the player's Pokemon or the opponent's
  detail: string;  // Move name OR switch-in species name
};

type BattleTurn = {
  actions: TurnAction[]; // Ordered list of actions in the turn
};

type BattleRecord = {
  id: string;
  teamId: string;
  date: string;
  opponentPokemon: string[]; // 1-4 opposing species names
  lead: string[]; // 1-4 player party species names
  turns: BattleTurn[];
};

