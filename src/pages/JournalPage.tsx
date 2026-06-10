import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineBolt,
  HiOutlineLightBulb,
  HiArrowLongLeft,
  HiOutlineShare,
  HiOutlineCheck,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { exportTeamToPokepaste } from "../utils/parsePokepaste";
import RosterSection from "../components/organisms/RosterSection";
import OffensiveCoverage from "../components/molecules/OffensiveCoverage";
import DefensiveCoverage from "../components/molecules/DefensiveCoverage";
import SubsectionCard from "../components/organisms/SubsectionCard";
import Dialog from "../components/molecules/Dialog";
import Button from "../components/atoms/Button";
import TextArea from "../components/atoms/TextArea";
import { useGameStore } from "../store/gameStore";
import BattleRecordCard from "../components/molecules/BattleRecordCard";



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

  const [insights, setInsights] = useState(team?.additionalInsights || "");
  const [name, setName] = useState(team?.name || "");
  const [copied, setCopied] = useState(false);

  const battleRecords = useGameStore((s) => s.battleRecords);
  const deleteBattleRecord = useGameStore((s) => s.deleteBattleRecord);
  const teamRecords = battleRecords.filter((r) => r.teamId === id);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

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
      setInsights(team.additionalInsights || "");
      setCopied(false);
    }
  }, [id, team]);

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


      {/* Offensive Coverage */}
      <SubsectionCard title="Offensive Coverage" icon={<HiOutlineSparkles />}>
        <OffensiveCoverage members={roster} />
      </SubsectionCard>

      {/* Defensive Coverage */}
      <SubsectionCard title="Defensive Coverage" icon={<HiOutlineShieldCheck />}>
        <DefensiveCoverage members={roster} />
      </SubsectionCard>

      {/* Strategic Leads */}
      {/* Battle History */}
      <SubsectionCard title="Battle History" icon={<HiOutlineBolt />}>
        {teamRecords.length === 0 ? (
          <div className="py-8 text-center text-white/20 text-xs border border-dashed border-white/5 rounded-xl bg-[#161C29]/50">
            No battle records saved yet. Use the Live Match Assistant to log battles!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {teamRecords.map((record) => (
              <BattleRecordCard
                key={record.id}
                record={record}
                onDelete={() => setDeletingRecordId(record.id)}
              />
            ))}
          </div>
        )}
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

      {/* Delete Battle Record Dialog */}
      <Dialog
        isOpen={deletingRecordId !== null}
        question="Delete this battle record? This action cannot be undone."
        onCancel={() => setDeletingRecordId(null)}
        onConfirm={() => {
          if (deletingRecordId !== null) {
            deleteBattleRecord(deletingRecordId);
          }
          setDeletingRecordId(null);
        }}
      />
    </div>
  );
};

export default JournalPage;
