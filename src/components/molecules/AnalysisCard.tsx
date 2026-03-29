import type { FC } from "react";
import Tag from "../atoms/Tag";
import type { TagVariant } from "../atoms/Tag";
import TextArea from "../atoms/TextArea";

interface PokemonThumb {
  name: string;
  imageUrl: string;
}

interface AnalysisCardProps {
  description: string;
  onDescriptionChange?: (value: string) => void;
  /** Shown as a bold header — used in the "threat" layout */
  title?: string;
  /** Tag displayed right-aligned next to the title */
  tag?: { label: string; variant?: TagVariant };
  /** Small Pokemon thumbnails — used in the "strategic lead" layout */
  pokemon?: PokemonThumb[];
}

const AnalysisCard: FC<AnalysisCardProps> = ({
  description,
  onDescriptionChange,
  title,
  tag,
  pokemon,
}) => {
  const hasThumbnails = pokemon && pokemon.length > 0;
  const hasHeader = title || tag;

  return (
    <div
      className="rounded-2xl bg-[#161C29] px-5 py-4 flex flex-col gap-3"
      style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.06)" }}
    >
      {/* Thumbnail row — strategic lead layout */}
      {hasThumbnails && (
        <div className="flex items-center gap-2">
          {pokemon.map((p) => (
            <div
              key={p.name}
              className="w-14 h-14 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center shrink-0"
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Title + tag row — threat layout */}
      {hasHeader && (
        <div className="flex items-center justify-between gap-4">
          {title && (
            <span className="text-white font-semibold text-sm">{title}</span>
          )}
          {tag && <Tag label={tag.label} variant={tag.variant ?? "default"} />}
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
