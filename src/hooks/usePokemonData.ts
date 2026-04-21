import { useQuery } from "@tanstack/react-query";
import { PokemonClient } from "pokenode-ts";

export const api = new PokemonClient();

export const pokemonQueryOptions = (name: string) => ({
  queryKey: ["pokemon", name.toLowerCase()] as const,
  queryFn: () => api.getPokemonByName(name.toLowerCase()),
});

export const usePokemonData = (name: string) => {
  return useQuery({
    ...pokemonQueryOptions(name),
    enabled: !!name,
  });
};
