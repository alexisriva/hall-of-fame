import type { FC } from "react";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import Tag from "../atoms/Tag";
import type { TagVariant } from "../atoms/Tag";
import TextArea from "../atoms/TextArea";

interface AnalysisCardProps {
  description: string;
  onDescriptionChange?: (value: string) => void;
  /** Shown as a bold header — used in the "threat" layout */
  title?: string;
  /** Tag displayed right-aligned next to the title */
  tag?: { label: string; variant?: TagVariant };
  /** Small Pokemon thumbnails — used in the "strategic lead" layout */
  pokemon?: PokemonBuild[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const AnalysisCard: FC<AnalysisCardProps> = ({
  description,
  onDescriptionChange,
  title,
  tag,
  pokemon,
  onEdit,
  onDelete,
}) => {
  const hasThumbnails = pokemon && pokemon.length > 0;
  const hasHeader = title || tag;
  const hasActions = onEdit || onDelete;

  return (
    <div
      className="rounded-2xl bg-[#161C29] px-5 py-4 flex flex-col gap-3"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.06)" }}
    >
      {/* Top row: main content + action buttons */}
      {(hasThumbnails || hasHeader || hasActions) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Thumbnail row — strategic lead layout */}
            {hasThumbnails && (
              <div className="flex items-center gap-2">
                {pokemon.map((p) => (
                  <div
                    key={p.id}
                    className="w-14 h-14 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center shrink-0"
                  >
                    <img
                      src={p.species!.sprite}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Title + tag row — threat layout */}
            {hasHeader && (
              <div className="flex items-center gap-3">
                {title && (
                  <span className="text-white font-semibold text-sm capitalize">
                    {title}
                  </span>
                )}
                {tag && (
                  <Tag label={tag.label} variant={tag.variant ?? "default"} />
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {hasActions && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <HiOutlinePencilSquare size={15} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg text-white/30 hover:text-[#b22200] hover:bg-[#b22200]/10 transition-colors cursor-pointer"
                >
                  <HiOutlineTrash size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Body text */}
      <TextArea
        value={description}
        onChange={onDescriptionChange ?? (() => {})}
      />
    </div>
  );
};

export default AnalysisCard;
