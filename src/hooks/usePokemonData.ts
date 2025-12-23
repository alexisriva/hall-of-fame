import { useQuery } from "@tanstack/react-query";

const fetchPokemon = async (name: string): Promise<PokemonApiData> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name}`);
  }
  return response.json();
};

export const usePokemonData = (name: string) => {
  return useQuery({
    queryKey: ["pokemon", name.toLowerCase()],
    queryFn: () => fetchPokemon(name),
    enabled: !!name,
  });
};
