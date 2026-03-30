import type { FC, ReactNode } from "react";
import SubsectionTitle from "../molecules/SubsectionTitle";

interface SubsectionCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

const SubsectionCard: FC<SubsectionCardProps> = ({ title, icon, children, action }) => (
  <div
    className="rounded-2xl bg-[#10141E] px-6 py-5 flex flex-col gap-5"
    style={{ boxShadow: "0 12px 40px rgba(42, 55, 94, 0.06)" }}
  >
    <div className="flex items-center justify-between">
      <SubsectionTitle title={title} icon={icon} />
      {action && <div>{action}</div>}
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default SubsectionCard;
