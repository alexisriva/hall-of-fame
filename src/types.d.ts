// -- External API Types (Keep these for fetching sprite/type data) --
type PokemonApiData = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other?: {
      "official-artwork": {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }[];
  moves: {
    move: {
      name: string;
    };
  }[];
};

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
  isShiny: boolean;
  item: string;
  ability: string;
  nature: Nature;
  moves: [string, string, string, string];
  evs: Stats;
  ivs: Stats;
};

type Pokemon = {
  id: string; // uuid
  species: string; // e.g. "gengar" - used to fetch API data
  activeBuildId: string | null; // ID of the currently "Equipped" build
  savedBuilds: PokemonBuild[];
};
