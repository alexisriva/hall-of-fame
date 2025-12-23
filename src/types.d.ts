type FirestoreTeamMember = {
  name: string;
  isShiny: boolean;
  role: string;
};

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
};
