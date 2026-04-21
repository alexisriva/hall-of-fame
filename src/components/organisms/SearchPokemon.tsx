import { useState, useEffect, type FC } from "react";
import { usePokemonData } from "../../hooks/usePokemonData";
import { resolveBestSprite } from "../../utils/helpers";
import Button from "../atoms/Button";
import TextInput from "../atoms/TextInput";
import Loading from "../atoms/Loading";

interface Props {
  onClose: () => void;
  onConfirm: (species: string) => void;
}

const SearchPokemon: FC<Props> = ({ onClose, onConfirm }) => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const { data, isLoading } = usePokemonData(search);

  const [spriteUrl, setSpriteUrl] = useState("");

  useEffect(() => {
    const updateSprite = async () => {
      const url = await resolveBestSprite(data);
      console.log(url);
      setSpriteUrl(url);
    };
    updateSprite();
  }, [data]);

  const handleConfirm = () => {
    if (!search.trim()) return;
    if (isLoading) return;
    if (!data) {
      setError("Pokemon not found. Try another name.");
      return;
    }
    onConfirm(search.trim().toLowerCase());
    setSearch("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setSearch("");
    setError("");
    onClose();
  };

  return (
    <div>
      {/* Preview */}
      <div className="flex flex-col items-center justify-center min-h-[120px] rounded-xl bg-white/5">
        {search && isLoading ? (
          <Loading size="md" />
        ) : spriteUrl ? (
          <img
            src={spriteUrl}
            alt="preview"
            className="w-24 h-24 object-contain"
          />
        ) : (
          <span className="text-white/25 text-sm italic">
            {search ? "Not found" : "Preview"}
          </span>
        )}
      </div>

      {/* Species input */}
      <div className="flex flex-col gap-2">
        <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
          Species Name
        </span>
        <TextInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setError("");
          }}
          placeholder="e.g. Charizard"
          autoFocus
        />
        {error && <span className="text-[#b22200] text-xs">{error}</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button label="Cancel" variant="secondary" onClick={handleClose} />
        <Button
          label="Add Member"
          variant="primary"
          onClick={handleConfirm}
          disabled={!search.trim() || isLoading || !spriteUrl}
        />
      </div>
    </div>
  );
};

export default SearchPokemon;
