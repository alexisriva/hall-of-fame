import type { FC } from "react";
import TeamCard from "./TeamCard";

interface Props {
  members: FirestoreTeamMember[];
}

const TeamGrid: FC<Props> = ({ members }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-7xl mx-auto p-4">
    {members.map((member, index) => (
      <TeamCard key={`${member.name}-${index}`} member={member} />
    ))}
  </div>
);

export default TeamGrid;
