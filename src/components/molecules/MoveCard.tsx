import { type FC } from "react";
import { HiXMark } from "react-icons/hi2";
import TypeIcon from "../atoms/TypeIcon";
import { getMoveShowdownData } from "../../utils/pkmnDataHelper";
import { capitalize } from "../../utils/helpers";

interface MoveCardProps {
  moveName: string;
  onClear: () => void;
}

const MoveCard: FC<MoveCardProps> = ({ moveName, onClear }) => {
  const moveData = getMoveShowdownData(moveName);

  if (!moveData) {
    // Fallback if the move data is not found in Dex
    return (
      <div className="relative w-full rounded-xl bg-[#161C29] border border-white/5 px-4 py-3 flex items-center justify-between text-white/50 text-sm">
        <span className="capitalize">{moveName.replace(/-/g, " ")}</span>
        <button
          onClick={onClear}
          className="text-white/20 hover:text-[#b22200] transition-colors cursor-pointer"
          title="Clear Move"
        >
          <HiXMark size={16} />
        </button>
      </div>
    );
  }

  const { name, category, basePower, type } = moveData;

  // Style mapping for Category Badges
  const getCategoryStyles = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "physical":
        return "bg-red-500/15 text-red-400 border-red-500/25";
      case "special":
        return "bg-blue-500/15 text-blue-400 border-blue-500/25";
      default:
        return "bg-purple-500/15 text-purple-400 border-purple-500/25";
    }
  };

  return (
    <div
      className="relative w-full rounded-xl bg-[#161C29] border border-white/5 px-4 py-3 flex flex-col gap-2.5 hover:bg-[#1c2335] hover:border-white/10 transition-all duration-200"
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}
    >
      {/* Top row: Name + Clear button */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-white font-bold text-sm leading-tight tracking-wide">
          {name}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="text-white/20 hover:text-[#b22200] hover:scale-110 transition-all cursor-pointer p-0.5"
          title="Clear Move"
        >
          <HiXMark size={16} />
        </button>
      </div>

      {/* Bottom row: Info badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type Badge */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg pl-1.5 pr-2 py-0.5 text-[10px] font-semibold text-white/70">
          <TypeIcon type={type} size={12} />
          <span>{capitalize(type)}</span>
        </div>

        {/* Category Badge */}
        <span
          className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${getCategoryStyles(
            category,
          )}`}
        >
          {category}
        </span>

        {/* Base Power Badge */}
        <span className="bg-white/5 border border-white/5 text-white/50 px-2 py-0.5 rounded-lg text-[10px] font-medium font-mono">
          BP: {basePower > 0 ? basePower : "—"}
        </span>
      </div>
    </div>
  );
};

export default MoveCard;
