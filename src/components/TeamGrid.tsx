import type { FC } from "react";
import TeamCard from "./TeamCard";

import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

interface Props {
  members: (Pokemon | null)[];
}

const TeamGrid: FC<Props> = ({ members }) => {
  const navigate = useNavigate();
  const selectPokemon = useGameStore((state) => state.selectPokemon);
  const swapSelection = useGameStore((state) => state.swapSelection);
  const setSwapSelection = useGameStore((state) => state.setSwapSelection);
  const movePokemon = useGameStore((state) => state.movePokemon);

  const isSwapMode = !!swapSelection;

  const handleSlotClick = (index: number, member: Pokemon | null) => {
    if (isSwapMode) {
      // Execute Move
      movePokemon(swapSelection.loc, swapSelection.index, "party", index);
    } else {
      // Normal Interaction
      if (member) {
        selectPokemon(member.id);
        navigate(`/builds/${member.id}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-[1600px] mx-auto p-4">
      {members.map((member, index) => {
        // Render Pokemon Card
        if (member) {
          return (
            <TeamCard
              key={member.id}
              data={member}
              onClick={() => handleSlotClick(index, member)}
              onMove={() => setSwapSelection({ loc: "party", index })}
              isSwapMode={isSwapMode}
            />
          );
        }

        // Render Empty Slot
        return (
          <div
            key={`empty-${index}`}
            onClick={() => handleSlotClick(index, null)}
            className={`
                    border-2 border-dashed rounded-xl h-[400px] flex items-center justify-center transition-all cursor-pointer
                    ${
                      isSwapMode
                        ? "border-amber-500 bg-amber-500/10 animate-pulse scale-95"
                        : "border-white/10 bg-white/5 opacity-50 hover:opacity-100 hover:border-white/30"
                    }
                `}
          >
            <div className="text-center">
              <span className="text-4xl block mb-2 text-white/50">+</span>
              {isSwapMode && (
                <span className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                  Target Slot
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamGrid;
