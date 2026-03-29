import { useState, type FC } from "react";
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const ROSTER = [
  { name: "Charizard", imageUrl: SPRITE(6), types: ["fire", "flying"] },
  { name: "Pikachu", imageUrl: SPRITE(25), types: ["electric"] },
  { name: "Greninja", imageUrl: SPRITE(658), types: ["water", "dark"] },
  { name: "Lucario", imageUrl: SPRITE(448), types: ["fighting", "steel"] },
  { name: "Togekiss", imageUrl: SPRITE(468), types: ["fairy", "flying"] },
  { name: "Garchomp", imageUrl: SPRITE(445), types: ["dragon", "ground"] },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const JournalPage: FC = () => {
  const [lead1, setLead1] = useState(
    "High speed tier and Fake Out pressure makes it the perfect turn-1 scout. Paralysis chance with G-Max Volt Crash creates openings for Lucario.",
  );
  const [lead2, setLead2] = useState(
    "Protean ability provides unmatched type-coverage from turn 1. Use against glass-cannon teams to secure early KOs.",
  );
  const [threat1, setThreat1] = useState(
    "Rain team boost makes it hard to outspeed even with Pikachu. Origin Pulse hits both team slots for heavy damage.",
  );
  const [threat2, setThreat2] = useState(
    "Behemoth Blade OHKOs Togekiss and Garchomp. Must rely on Lucario's priority moves to chip away health.",
  );
  const [obs, setObs] = useState(
    `Current team synergy relies heavily on the "Speed-Aggression" pivot. Togekiss provides essential Follow Me support, allowing Garchomp to set up Swords Dance safely. However, the team lacks a reliable trick-room counter, making it vulnerable to slow, bulky builds like Hatterene/Indeedee cores.\n\nPotential adjustment: Replace Greninja with a more defensive presence if regional tournaments trend toward stall tactics. Testing Incineroar for Intimidate rotations is recommended in the next field cycle.`,
  );

  return (
    <div className="flex flex-col gap-8 px-8 py-10">
        {/* Dossier header */}
        <header className="flex flex-col gap-1">
          <span className="text-xs text-[#b22200] font-semibold uppercase tracking-[0.2em]">
            Team Dossier
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
            Vanguard Elite 01
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Detailed analysis of current competitive roster for the upcoming
            Indigo Circuit championship.
          </p>
        </header>

        {/* Active Roster */}
        <RosterSection members={ROSTER} capacity={6} />

        {/* Strategic Leads */}
        <SubsectionCard title="Strategic Leads" icon={<HiOutlineBolt />}>
          <AnalysisCard
            pokemon={[
              { name: "Pikachu", imageUrl: SPRITE(25) },
              { name: "Charizard", imageUrl: SPRITE(6) },
            ]}
            description={lead1}
            onDescriptionChange={setLead1}
          />
          <AnalysisCard
            pokemon={[
              { name: "Greninja", imageUrl: SPRITE(658) },
              { name: "Lucario", imageUrl: SPRITE(448) },
            ]}
            description={lead2}
            onDescriptionChange={setLead2}
          />
        </SubsectionCard>

        {/* Critical Threats */}
        <SubsectionCard title="Critical Threats" icon={<HiOutlineExclamationTriangle />}>
          <AnalysisCard
            title="Kyogre"
            tag={{ label: "God-Tier Threat", variant: "info" }}
            description={threat1}
            onDescriptionChange={setThreat1}
          />
          <AnalysisCard
            title="Zacian-Crowned"
            tag={{ label: "Speed Hazard", variant: "default" }}
            description={threat2}
            onDescriptionChange={setThreat2}
          />
        </SubsectionCard>

        {/* Researcher Observations */}
        <SubsectionCard title="Researcher Observations" icon={<HiOutlineLightBulb />}>
          <TextArea value={obs} onChange={setObs} rows={6} />
          <div className="flex items-center gap-2 flex-wrap">
            <Button label="Win Rate: 68%" variant="primary" />
            <Button label="Top 500 Global" variant="secondary" />
          </div>
        </SubsectionCard>
    </div>
  );
};

export default JournalPage;
