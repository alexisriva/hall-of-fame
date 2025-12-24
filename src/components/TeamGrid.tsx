import type { FC } from "react";
import TeamCard from "./TeamCard";

import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

interface Props {
  members: Pokemon[];
}

const TeamGrid: FC<Props> = ({ members }) => {
  const navigate = useNavigate();
  const selectPokemon = useGameStore((state) => state.selectPokemon);

  const handleCardClick = (id: string) => {
    selectPokemon(id);
    navigate(`/builds/${id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-[1600px] mx-auto p-4">
      {members.map((member) => (
        <TeamCard
          key={member.id}
          data={member}
          onClick={() => handleCardClick(member.id)}
        />
      ))}
    </div>
  );
};

export default TeamGrid;
