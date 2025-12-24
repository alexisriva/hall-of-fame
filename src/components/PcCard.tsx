import type { FC } from "react";
import { usePokemonData } from "../hooks/usePokemonData";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";

interface Props {
  member: Pokemon;
}

const PcCard: FC<Props> = ({ member }) => {
  const { species, isShiny, id } = member;
  const { data, isLoading } = usePokemonData(species);
  const selectPokemon = useGameStore((state) => state.selectPokemon);
  const navigate = useNavigate();

  const handleClick = () => {
    selectPokemon(id);
    navigate(`/builds/${id}`);
  };

  const spriteUrl = isShiny
    ? data?.sprites.front_shiny
    : data?.sprites.front_default;

  return (
    <div
      onClick={handleClick}
      className="relative w-20 h-20 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center group"
    >
      {isLoading ? (
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      ) : (
        <>
          <img
            src={spriteUrl}
            alt={species}
            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
          />
          {isShiny && (
            <span className="absolute top-1 right-1 text-xs">✨</span>
          )}
        </>
      )}
    </div>
  );
};

export default PcCard;
