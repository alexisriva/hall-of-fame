import { type FC } from "react";
import {
  HiOutlineBolt,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import RosterSection from "../components/organisms/RosterSection";
import SubsectionCard from "../components/organisms/SubsectionCard";
import AnalysisCard from "../components/molecules/AnalysisCard";
import Button from "../components/atoms/Button";
import TextArea from "../components/atoms/TextArea";

interface Props {
  team: PokemonTeam;
}

const JournalPage: FC<Props> = ({ team }) => {
  return (
    <div className="flex flex-col gap-8 px-8 py-10">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <span className="text-xs text-[#b22200] font-semibold uppercase tracking-[0.2em]">
          Team {team.id}
        </span>
        <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
          {team.name}
        </h1>
      </header>

      {/* Active Roster */}
      <RosterSection members={team.pokemon} capacity={6} />

      {/* Strategic Leads */}
      <SubsectionCard title="Strategic Leads" icon={<HiOutlineBolt />}>
        {team.leads.map((lead) => (
          <AnalysisCard
            pokemon={lead.pokemon}
            description={lead.notes}
            onDescriptionChange={() => {}}
          />
        ))}
      </SubsectionCard>

      {/* Critical Threats */}
      <SubsectionCard
        title="Critical Threats"
        icon={<HiOutlineExclamationTriangle />}
      >
        {team.counters.map((counter) => (
          <AnalysisCard
            title={counter.pokemon.species!.name}
            tag={{ label: "God-Tier Threat", variant: "info" }}
            description={counter.notes}
            onDescriptionChange={() => {}}
          />
        ))}
      </SubsectionCard>

      {/* Additional Insights */}
      <SubsectionCard title="Additional Insights" icon={<HiOutlineLightBulb />}>
        <TextArea
          value={team.additionalInsights}
          onChange={() => {}}
          rows={6}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button label={`Wins: ${team.wins}`} variant="primary" />
          <Button label={`Losses: ${team.losses}`} variant="secondary" />
        </div>
      </SubsectionCard>
    </div>
  );
};

export default JournalPage;
