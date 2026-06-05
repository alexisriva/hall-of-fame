import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineBolt,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiArrowLongLeft,
  HiOutlineShare,
  HiOutlineCheck,
} from "react-icons/hi2";
import { exportTeamToPokepaste } from "../utils/parsePokepaste";
import RosterSection from "../components/organisms/RosterSection";
import WeaknessIndex from "../components/molecules/WeaknessIndex";
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
  const roster = (team?.pokemon ?? [])
    .map((id) => builds.find((b) => b.id === id))
    .filter(Boolean) as PokemonBuild[];

  const [leads, setLeads] = useState<MatchLead[]>(team?.leads || []);
  const [counters, setCounters] = useState<MatchCounter[]>(
    team?.counters || [],
  );
  const [insights, setInsights] = useState(team?.additionalInsights || "");
  const [name, setName] = useState(team?.name || "");

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [editingLeadIdx, setEditingLeadIdx] = useState<number | null>(null);
  const [editingCounterIdx, setEditingCounterIdx] = useState<number | null>(
    null,
  );
  const [deletingLeadIdx, setDeletingLeadIdx] = useState<number | null>(null);
  const [deletingCounterIdx, setDeletingCounterIdx] = useState<number | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const handleShareTeam = () => {
    if (!team) return;
    const paste = exportTeamToPokepaste(roster);
    navigator.clipboard.writeText(paste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sync state if navigation target (id) changes
  useEffect(() => {
    if (team) {
      setName(team.name);
      setLeads(team.leads || []);
      setCounters(team.counters || []);
      setInsights(team.additionalInsights || "");
      setCopied(false);
    }
  }, [id]);

  // Debounced autosave for team name
  useEffect(() => {
    if (!team || name === team.name) return;
    const timer = setTimeout(() => {
      updateTeam(team.id, { name });
    }, 500);
    return () => clearTimeout(timer);
  }, [name, team?.id, team?.name, updateTeam]);

  // Debounced autosave for additional insights
  useEffect(() => {
    if (!team || insights === team.additionalInsights) return;
    const timer = setTimeout(() => {
      updateTeam(team.id, { additionalInsights: insights });
    }, 500);
    return () => clearTimeout(timer);
  }, [insights, team?.id, team?.additionalInsights, updateTeam]);

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-white/20 text-sm">Team not found.</span>
        <Button
          label="Back to Teams"
          variant="secondary"
          onClick={() => navigate("/team-hub")}
        />
      </div>
    );
  }

  const closeLeadModal = () => {
    setLeadModalOpen(false);
    setEditingLeadIdx(null);
  };

  const closeCounterModal = () => {
    setCounterModalOpen(false);
    setEditingCounterIdx(null);
  };

  const handleSaveLead = (lead: MatchLead) => {
    let newLeads;
    if (editingLeadIdx !== null) {
      newLeads = leads.map((l, i) => (i === editingLeadIdx ? lead : l));
    } else {
      newLeads = [...leads, lead];
    }
    setLeads(newLeads);
    updateTeam(team.id, { leads: newLeads });
    closeLeadModal();
  };

  const handleDeleteLead = (idx: number) => {
    const newLeads = leads.filter((_, i) => i !== idx);
    setLeads(newLeads);
    updateTeam(team.id, { leads: newLeads });
  };

  const handleSaveCounter = (counter: MatchCounter) => {
    let newCounters;
    if (editingCounterIdx !== null) {
      newCounters = counters.map((c, i) =>
        i === editingCounterIdx ? counter : c,
      );
    } else {
      newCounters = [...counters, counter];
    }
    setCounters(newCounters);
    updateTeam(team.id, { counters: newCounters });
    closeCounterModal();
  };

  const handleDeleteCounter = (idx: number) => {
    const newCounters = counters.filter((_, i) => i !== idx);
    setCounters(newCounters);
    updateTeam(team.id, { counters: newCounters });
  };

  const handleNameBlur = () => {
    if (name.trim() === "") {
      setName(team.name);
    } else {
      updateTeam(team.id, { name: name.trim() });
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 px-4 py-6 md:px-8 md:py-10">
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-none bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 w-full placeholder:text-white/20"
            placeholder="Enter team name..."
          />
        </div>
      </header>

      {/* Active Roster */}
      <RosterSection
        memberIds={team.pokemon}
        capacity={6}
        onAdd={(buildId) =>
          updateTeam(team.id, { pokemon: [...team.pokemon, buildId] })
        }
        onAddMultiple={(buildIds) =>
          updateTeam(team.id, { pokemon: [...team.pokemon, ...buildIds] })
        }
        onRemove={(buildId) =>
          updateTeam(team.id, {
            pokemon: team.pokemon.filter((id) => id !== buildId),
          })
        }
      />

      {/* Weakness Index */}
      <SubsectionCard title="Weakness Index" icon={<HiOutlineChartBar />}>
        <WeaknessIndex members={roster} />
      </SubsectionCard>

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
            onDescriptionChange={(notes) => {
              const newLeads = leads.map((l, idx) =>
                idx === i ? { ...l, notes } : l,
              );
              setLeads(newLeads);
              updateTeam(team.id, { leads: newLeads });
            }}
            onEdit={() => {
              setEditingLeadIdx(i);
              setLeadModalOpen(true);
            }}
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
            onDescriptionChange={(notes) => {
              const newCounters = counters.map((c, idx) =>
                idx === i ? { ...c, notes } : c,
              );
              setCounters(newCounters);
              updateTeam(team.id, { counters: newCounters });
            }}
            onEdit={() => {
              setEditingCounterIdx(i);
              setCounterModalOpen(true);
            }}
            onDelete={() => setDeletingCounterIdx(i)}
          />
        ))}
      </SubsectionCard>

      {/* Additional Insights */}
      <SubsectionCard title="Additional Insights" icon={<HiOutlineLightBulb />}>
        <TextArea value={insights} onChange={setInsights} rows={6} />
      </SubsectionCard>

      {/* Share Team Section */}
      <div className="flex justify-center py-6 border-t border-white/5 mt-4">
        <Button
          label={copied ? "Copied to clipboard!" : "Share your team!"}
          variant="primary"
          icon={copied ? <HiOutlineCheck size={16} /> : <HiOutlineShare size={16} />}
          onClick={handleShareTeam}
        />
      </div>

      {/* Lead Modal */}
      <Modal
        isOpen={leadModalOpen}
        title={
          editingLeadIdx !== null ? "Edit Strategic Lead" : "Add Strategic Lead"
        }
        onClose={closeLeadModal}
      >
        <MatchLeadForm
          roster={
            team.pokemon
              .map((id) => builds.find((b) => b.id === id))
              .filter(Boolean) as PokemonBuild[]
          }
          onSubmit={handleSaveLead}
          onCancel={closeLeadModal}
          initialPokemon={
            editingLeadIdx !== null ? leads[editingLeadIdx].pokemon : undefined
          }
          initialNotes={
            editingLeadIdx !== null ? leads[editingLeadIdx].notes : undefined
          }
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
          if (deletingCounterIdx !== null)
            handleDeleteCounter(deletingCounterIdx);
          setDeletingCounterIdx(null);
        }}
      />

      {/* Counter Modal */}
      <Modal
        isOpen={counterModalOpen}
        title={
          editingCounterIdx !== null
            ? "Edit Critical Threat"
            : "Add Critical Threat"
        }
        onClose={closeCounterModal}
      >
        <MatchCounterForm
          onSubmit={handleSaveCounter}
          onCancel={closeCounterModal}
          initialSpeciesName={
            editingCounterIdx !== null
              ? counters[editingCounterIdx].pokemon.species?.name
              : undefined
          }
          initialNotes={
            editingCounterIdx !== null
              ? counters[editingCounterIdx].notes
              : undefined
          }
        />
      </Modal>
    </div>
  );
};

export default JournalPage;
