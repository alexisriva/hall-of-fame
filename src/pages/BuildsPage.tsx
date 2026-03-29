import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import Button from "../components/atoms/Button";
import BuildCard from "../components/molecules/BuildCard";
import Modal from "../components/molecules/Modal";
import Dialog from "../components/molecules/Dialog";
import BuildManager from "../components/organisms/BuildManager";
import { HiOutlineTrash, HiPlus } from "react-icons/hi2";
import SearchPokemon from "../components/organisms/SearchPokemon";

const BuildsPage = () => {
  const builds = useGameStore((s) => s.builds);
  const deleteBuild = useGameStore((s) => s.deleteBuild);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [buildManagerOpen, setBuildManagerOpen] = useState(false);
  const [pendingSpecies, setPendingSpecies] = useState("");
  const [editingBuild, setEditingBuild] = useState<PokemonBuild | undefined>();
  const [deletingBuildId, setDeletingBuildId] = useState<string | null>(null);

  // Group builds by species name
  const grouped = builds.reduce<Record<string, PokemonBuild[]>>(
    (acc, build) => {
      const key = build.species?.name ?? "__unknown__";
      if (!acc[key]) acc[key] = [];
      acc[key].push(build);
      return acc;
    },
    {},
  );

  const handleConfirmSpecies = (species: string) => {
    setPendingSpecies(species);
    setEditingBuild(undefined);
    setBuildManagerOpen(true);
  };

  const handleEditBuild = (build: PokemonBuild) => {
    setPendingSpecies(build.species?.name ?? "");
    setEditingBuild(build);
    setBuildManagerOpen(true);
  };

  const closeBuildManager = () => {
    setBuildManagerOpen(false);
    setEditingBuild(undefined);
    setPendingSpecies("");
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-10">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
              Active Builds
            </h1>
            <span className="text-xs text-white/30 font-semibold uppercase tracking-[0.2em]">
              — {builds.length} {builds.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>

        <Button
          label="Add New Build"
          variant="primary"
          icon={<HiPlus />}
          onClick={() => setAddModalOpen(true)}
        />
      </header>

      {/* Build groups */}
      {builds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-white/20 text-5xl">⚔</span>
          <span className="text-white/30 text-sm">
            No builds yet. Add your first one.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([speciesName, speciesBuilds]) => (
            <section key={speciesName} className="flex flex-col gap-4">
              {/* Species header */}
              <div className="flex items-center gap-3">
                <div className="w-0.5 h-5 bg-[#b22200] rounded-full shrink-0" />
                <h2 className="text-white font-bold text-lg capitalize">
                  {speciesName === "__unknown__" ? "Unknown" : speciesName}
                </h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Build cards grid */}
              <div className="grid grid-cols-3 gap-3">
                {speciesBuilds.map((build) => (
                  <div key={build.id} className="relative group/card">
                    <BuildCard
                      build={build}
                      onClick={() => handleEditBuild(build)}
                    />
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingBuildId(build.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-[#b22200] hover:bg-[#b22200]/10 transition-colors opacity-0 group-hover/card:opacity-100 cursor-pointer"
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add Pokemon Modal */}
      <Modal
        isOpen={addModalOpen}
        title="Add New Build"
        onClose={() => setAddModalOpen(false)}
        size="md"
      >
        <SearchPokemon
          onClose={() => setAddModalOpen(false)}
          onConfirm={handleConfirmSpecies}
        />
      </Modal>

      {/* Delete Build Dialog */}
      <Dialog
        isOpen={deletingBuildId !== null}
        question="Delete this build? This action cannot be undone."
        onCancel={() => setDeletingBuildId(null)}
        onConfirm={() => {
          if (deletingBuildId) deleteBuild(deletingBuildId);
          setDeletingBuildId(null);
        }}
      />

      {/* Build Manager Modal */}
      {pendingSpecies && (
        <Modal
          isOpen={buildManagerOpen}
          title={
            editingBuild
              ? `Edit — ${editingBuild.name}`
              : `New Build — ${pendingSpecies}`
          }
          onClose={closeBuildManager}
          size="lg"
        >
          <BuildManager
            species={pendingSpecies}
            initialBuild={editingBuild}
            onClose={closeBuildManager}
          />
        </Modal>
      )}
    </div>
  );
};

export default BuildsPage;
