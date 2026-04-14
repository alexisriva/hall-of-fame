import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi2";
import { useGameStore } from "../store/gameStore";
import Button from "../components/atoms/Button";
import TextInput from "../components/atoms/TextInput";
import Modal from "../components/molecules/Modal";
import Dialog from "../components/molecules/Dialog";
import TeamCard from "../components/molecules/TeamCard";
import { HiOutlineTrash } from "react-icons/hi2";
import { REGULATIONS } from "../utils/regulations";

const TeamHubPage = () => {
  const teams = useGameStore((s) => s.teams);
  const addTeam = useGameStore((s) => s.addTeam);
  const deleteTeam = useGameStore((s) => s.deleteTeam);
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [regulation, setRegulation] = useState<string>(REGULATIONS[0]);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!teamName.trim()) return;
    addTeam({
      name: teamName.trim(),
      regulation: regulation,
      pokemon: [],
      leads: [],
      counters: [],
      additionalInsights: "",
      wins: 0,
      losses: 0,
    });
    setTeamName("");
    setRegulation(REGULATIONS[0]);
    setCreateOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 px-4 py-6 md:px-8 md:py-10">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-none">
            Team Hub
          </h1>
          <span className="text-xs text-white/30 font-semibold uppercase tracking-[0.2em]">
            — {teams.length} {teams.length === 1 ? "team" : "teams"}
          </span>
        </div>
        <Button
          label="New Team"
          variant="primary"
          icon={<HiPlus />}
          onClick={() => setCreateOpen(true)}
        />
      </header>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-white/20 text-5xl">⚔</span>
          <span className="text-white/30 text-sm">
            No teams yet. Create your first one.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="relative group/card">
              <TeamCard
                team={team}
                onClick={() => navigate(`/team-hub/${team.id}`)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingTeamId(team.id);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-[#b22200] hover:bg-[#b22200]/10 transition-colors opacity-0 group-hover/card:opacity-100 cursor-pointer"
              >
                <HiOutlineTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create team modal */}
      <Modal
        isOpen={createOpen}
        title="New Team"
        onClose={() => setCreateOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
              Team Name
            </span>
            <TextInput
              value={teamName}
              onChange={setTeamName}
              placeholder="e.g. Sun Season"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">
              Regulation
            </span>
            <select
              value={regulation}
              onChange={(e) => setRegulation(e.target.value)}
              className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 appearance-none cursor-pointer transition-all"
            >
              {REGULATIONS.map((reg) => (
                <option key={reg} value={reg} className="bg-[#0F1115]">
                  {reg}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setCreateOpen(false)}
            />
            <Button
              label="Create"
              variant="primary"
              onClick={handleCreate}
              disabled={!teamName.trim()}
            />
          </div>
        </div>
      </Modal>

      {/* Delete dialog */}
      <Dialog
        isOpen={deletingTeamId !== null}
        question="Delete this team? This action cannot be undone."
        onCancel={() => setDeletingTeamId(null)}
        onConfirm={() => {
          if (deletingTeamId) deleteTeam(deletingTeamId);
          setDeletingTeamId(null);
        }}
      />
    </div>
  );
};

export default TeamHubPage;
