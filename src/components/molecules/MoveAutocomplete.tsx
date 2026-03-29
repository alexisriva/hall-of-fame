import { useState, type FC } from "react";
import { capitalize } from "../../utils/helpers";

interface MoveAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  availableMoves: string[];
  placeholder?: string;
}

const MoveAutocomplete: FC<MoveAutocompleteProps> = ({
  value,
  onChange,
  availableMoves,
  placeholder,
}) => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState(value);

  if (value !== query && !show) setQuery(value);

  const filtered =
    query === ""
      ? []
      : availableMoves
          .filter((m) => m.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          const val = capitalize(e.target.value.replace(/-/g, " "));
          setQuery(val);
          onChange(val);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-[#161C29] border border-white/5 rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1">
          {filtered.map((move) => (
            <div
              key={move}
              onMouseDown={(e) => {
                e.preventDefault();
                const val = capitalize(move.replace(/-/g, " "));
                setQuery(val);
                onChange(val);
                setShow(false);
              }}
              className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-[#b22200]/10 cursor-pointer transition-colors"
            >
              {capitalize(move.replace(/-/g, " "))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoveAutocomplete;
