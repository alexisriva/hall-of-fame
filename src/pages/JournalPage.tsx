import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineBolt,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiArrowLongLeft,
} from "react-icons/hi2";
import RosterSection from "../components/organisms/RosterSection";
import SubsectionCard from "../components/organisms/SubsectionCard";
import AnalysisCard from "../components/molecules/AnalysisCard";
import Modal from "../components/molecules/Modal";
import Dialog from "../components/molecules/Dialog";
import MatchLeadForm from "../components/molecules/MatchLeadForm";
import MatchCounterForm from "../components/molecules/MatchCounterForm";
import Button from "../components/atoms/Button";
import TextArea from "../components/atoms/TextArea";
import { useGameStore } from "../store/gameStore";

const JournalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teams = useGameStore((s) => s.teams);
  const builds = useGameStore((s) => s.builds);
  const updateTeam = useGameStore((s) => s.updateTeam);
  const team = teams.find((t) => t.id === id);

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-white/20 text-sm">Team not found.</span>
        <Button label="Back to Teams" variant="secondary" onClick={() => navigate("/team-hub")} />
      </div>
    );
  }
  const [leads, setLeads] = useState<MatchLead[]>(team.leads);
  const [counters, setCounters] = useState<MatchCounter[]>(team.counters);
  const [insights, setInsights] = useState(team.additionalInsights);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [editingLeadIdx, setEditingLeadIdx] = useState<number | null>(null);
  const [editingCounterIdx, setEditingCounterIdx] = useState<number | null>(null);
  const [deletingLeadIdx, setDeletingLeadIdx] = useState<number | null>(null);
  const [deletingCounterIdx, setDeletingCounterIdx] = useState<number | null>(null);

  const closeLeadModal = () => {
    setLeadModalOpen(false);
    setEditingLeadIdx(null);
  };

  const closeCounterModal = () => {
    setCounterModalOpen(false);
    setEditingCounterIdx(null);
  };

  const handleSaveLead = (lead: MatchLead) => {
    if (editingLeadIdx !== null) {
      setLeads((prev) => prev.map((l, i) => (i === editingLeadIdx ? lead : l)));
    } else {
      setLeads((prev) => [...prev, lead]);
    }
    closeLeadModal();
  };

  const handleDeleteLead = (idx: number) => {
    setLeads((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCounter = (counter: MatchCounter) => {
    if (editingCounterIdx !== null) {
      setCounters((prev) =>
        prev.map((c, i) => (i === editingCounterIdx ? counter : c)),
      );
    } else {
      setCounters((prev) => [...prev, counter]);
    }
    closeCounterModal();
  };

  const handleDeleteCounter = (idx: number) => {
    setCounters((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-10">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/team-hub")}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors cursor-pointer w-fit"
        >
          <HiArrowLongLeft size={18} />
          <span className="text-xs font-medium">Team Hub</span>
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#b22200] font-semibold uppercase tracking-[0.2em]">
            Team {team.id}
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
            {team.name}
          </h1>
        </div>
      </header>

      {/* Active Roster */}
      <RosterSection
        memberIds={team.pokemon}
        capacity={6}
        onAdd={(buildId) =>
          updateTeam(team.id, { pokemon: [...team.pokemon, buildId] })
        }
        onRemove={(buildId) =>
          updateTeam(team.id, {
            pokemon: team.pokemon.filter((id) => id !== buildId),
          })
        }
      />

      {/* Strategic Leads */}
      <SubsectionCard
        title="Strategic Leads"
        icon={<HiOutlineBolt />}
        action={
          <Button
            label="+ Add"
            variant="secondary"
            onClick={() => setLeadModalOpen(true)}
          />
        }
      >
        {leads.map((lead, i) => (
          <AnalysisCard
            key={i}
            pokemon={lead.pokemon}
            description={lead.notes}
            onDescriptionChange={(notes) =>
              setLeads((prev) =>
                prev.map((l, idx) => (idx === i ? { ...l, notes } : l)),
              )
            }
            onEdit={() => { setEditingLeadIdx(i); setLeadModalOpen(true); }}
            onDelete={() => setDeletingLeadIdx(i)}
          />
        ))}
      </SubsectionCard>

      {/* Critical Threats */}
      <SubsectionCard
        title="Critical Threats"
        icon={<HiOutlineExclamationTriangle />}
        action={
          <Button
            label="+ Add"
            variant="secondary"
            onClick={() => setCounterModalOpen(true)}
          />
        }
      >
        {counters.map((counter, i) => (
          <AnalysisCard
            key={i}
            title={counter.pokemon.species!.name}
            tag={{ label: "Threat", variant: "danger" }}
            description={counter.notes}
            onDescriptionChange={(notes) =>
              setCounters((prev) =>
                prev.map((c, idx) => (idx === i ? { ...c, notes } : c)),
              )
            }
            onEdit={() => { setEditingCounterIdx(i); setCounterModalOpen(true); }}
            onDelete={() => setDeletingCounterIdx(i)}
          />
        ))}
      </SubsectionCard>

      {/* Additional Insights */}
      <SubsectionCard title="Additional Insights" icon={<HiOutlineLightBulb />}>
        <TextArea value={insights} onChange={setInsights} rows={6} />
        <div className="flex items-center gap-2 flex-wrap">
          <Button label={`Wins: ${team.wins}`} variant="primary" />
          <Button label={`Losses: ${team.losses}`} variant="secondary" />
        </div>
      </SubsectionCard>

      {/* Lead Modal */}
      <Modal
        isOpen={leadModalOpen}
        title={editingLeadIdx !== null ? "Edit Strategic Lead" : "Add Strategic Lead"}
        onClose={closeLeadModal}
      >
        <MatchLeadForm
          roster={team.pokemon
            .map((id) => builds.find((b) => b.id === id))
            .filter(Boolean) as PokemonBuild[]}
          onSubmit={handleSaveLead}
          onCancel={closeLeadModal}
          initialPokemon={editingLeadIdx !== null ? leads[editingLeadIdx].pokemon : undefined}
          initialNotes={editingLeadIdx !== null ? leads[editingLeadIdx].notes : undefined}
        />
      </Modal>

      {/* Delete Lead Dialog */}
      <Dialog
        isOpen={deletingLeadIdx !== null}
        question="Delete this strategic lead? This action cannot be undone."
        onCancel={() => setDeletingLeadIdx(null)}
        onConfirm={() => {
          if (deletingLeadIdx !== null) handleDeleteLead(deletingLeadIdx);
          setDeletingLeadIdx(null);
        }}
      />

      {/* Delete Counter Dialog */}
      <Dialog
        isOpen={deletingCounterIdx !== null}
        question="Delete this critical threat? This action cannot be undone."
        onCancel={() => setDeletingCounterIdx(null)}
        onConfirm={() => {
          if (deletingCounterIdx !== null) handleDeleteCounter(deletingCounterIdx);
          setDeletingCounterIdx(null);
        }}
      />

      {/* Counter Modal */}
      <Modal
        isOpen={counterModalOpen}
        title={editingCounterIdx !== null ? "Edit Critical Threat" : "Add Critical Threat"}
        onClose={closeCounterModal}
      >
        <MatchCounterForm
          onSubmit={handleSaveCounter}
          onCancel={closeCounterModal}
          initialSpeciesName={editingCounterIdx !== null ? counters[editingCounterIdx].pokemon.species?.name : undefined}
          initialNotes={editingCounterIdx !== null ? counters[editingCounterIdx].notes : undefined}
        />
      </Modal>
    </div>
  );
};

export default JournalPage;
