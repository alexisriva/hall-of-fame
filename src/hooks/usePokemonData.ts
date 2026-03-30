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

export const pokemonQueryOptions = (name: string) => ({
  queryKey: ["pokemon", name.toLowerCase()] as const,
  queryFn: () => fetchPokemon(name),
});

export const usePokemonData = (name: string) => {
  return useQuery({
    ...pokemonQueryOptions(name),
    enabled: !!name,
  });
};
