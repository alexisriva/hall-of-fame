import { useState, useEffect, type FC } from "react";

interface Props {
  member: FirestoreTeamMember;
  onSave: (member: FirestoreTeamMember) => void;
  onCancel: () => void;
}

const PokemonEditor: FC<Props> = ({ member, onSave, onCancel }) => {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [isShiny, setIsShiny] = useState(member.isShiny);

  const [previewData, setPreviewData] = useState<PokemonApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounced fetch for preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (!name) return;

      setLoading(true);
      setError("");
      setPreviewData(null);

      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        );
        if (!response.ok) throw new Error("Pokemon not found");
        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        setError("Invalid Pokemon name");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timer);
  }, [name]);

  // Update local state when selected member changes
  useEffect(() => {
    setName(member.name);
    setRole(member.role);
    setIsShiny(member.isShiny);
    // Be sure to clear old preview data immediately to avoid showing wrong sprite state
    // while the new name debounce fetch kicks in
    setPreviewData(null);
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error || loading || !previewData) return;

    onSave({
      name: name.toLowerCase(),
      role,
      isShiny,
    });
  };

  const spriteUrl = previewData
    ? isShiny
      ? previewData.sprites.other?.["official-artwork"]?.front_shiny ||
        previewData.sprites.front_shiny
      : previewData.sprites.other?.["official-artwork"]?.front_default ||
        previewData.sprites.front_default
    : null;

  return (
    <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        {/* Preview Area */}
        <div className="flex justify-center mb-6 h-64 bg-black/20 rounded-xl relative overflow-hidden border border-white/5">
          {loading ? (
            <div className="self-center animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          ) : error ? (
            <div className="self-center text-red-400 text-sm font-medium">
              {error}
            </div>
          ) : spriteUrl ? (
            <div className="relative w-full h-full p-4">
              <img
                src={spriteUrl}
                alt="Preview"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              {isShiny && (
                <span className="absolute top-2 right-2 text-xl">✨</span>
              )}
            </div>
          ) : (
            <div className="self-center text-gray-500 italic text-sm">
              Start typing to see preview
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Pokemon Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white outline-none transition-all"
            placeholder="e.g. charizard"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Role / Title
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white outline-none transition-all"
            placeholder="e.g. The Sweeper"
          />
        </div>

        <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg border border-white/5">
          <input
            type="checkbox"
            id="shiny-toggle"
            checked={isShiny}
            onChange={(e) => setIsShiny(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-700"
          />
          <label
            htmlFor="shiny-toggle"
            className="text-sm font-medium text-gray-200 cursor-pointer select-none"
          >
            Shiny Variant
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!error || loading || !previewData}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default PokemonEditor;
