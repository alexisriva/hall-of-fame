import type { FC } from "react";
import TeamCard from "./TeamCard";

interface Props {
  members: FirestoreTeamMember[];
}

const TeamGrid: FC<Props> = ({ members }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-[1600px] mx-auto p-4">
    {members.map((member, index) => (
      <TeamCard key={`${member.name}-${index}`} member={member} />
    ))}
  </div>
);

export default TeamGrid;
