import type { FC } from "react";
import PcCard from "./PcCard";

import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

interface Props {
  members: (Pokemon | null)[];
}

const PcGrid: FC<Props> = ({ members }) => {
  const navigate = useNavigate();
  const selectPokemon = useGameStore((state) => state.selectPokemon);
  const swapSelection = useGameStore((state) => state.swapSelection);
  const setSwapSelection = useGameStore((state) => state.setSwapSelection);
  const movePokemon = useGameStore((state) => state.movePokemon);

  const isSwapMode = !!swapSelection;

  const handleSlotClick = (index: number, member: Pokemon | null) => {
    if (isSwapMode) {
      movePokemon(swapSelection.loc, swapSelection.index, "pc", index);
    } else {
      if (member) {
        selectPokemon(member.id);
        navigate(`/builds/${member.id}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
      {members.map((member, index) => {
        if (member) {
          return (
            <PcCard
              key={member.id}
              member={member}
              onClick={() => handleSlotClick(index, member)}
              onMove={() => setSwapSelection({ loc: "pc", index })}
              isSwapMode={isSwapMode}
            />
          );
        }

        return (
          <div
            key={`empty-${index}`}
            onClick={() => handleSlotClick(index, null)}
            className={`w-20 h-20 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center cursor-pointer transition-all
              ${
                isSwapMode
                  ? "bg-amber-500/10 border-amber-500 animate-pulse text-amber-500"
                  : "opacity-30 hover:opacity-100 hover:bg-white/10"
              }
              `}
          >
            <span className="text-2xl">+</span>
          </div>
        );
      })}
    </div>
  );
};

export default PcGrid;
