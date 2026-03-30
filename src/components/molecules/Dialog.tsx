import type { FC } from "react";
import { IoWarningOutline } from "react-icons/io5";
import Button from "../atoms/Button";

interface DialogProps {
  isOpen: boolean;
  question: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const Dialog: FC<DialogProps> = ({ isOpen, question, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#10141E] p-6 flex flex-col gap-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-xl font-bold flex items-center gap-2">
          <IoWarningOutline size={24} /> Warning
        </h3>
        <p className="text-white text-sm leading-relaxed">{question}</p>
        <div className="flex items-center justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={onCancel} />
          <Button label="Confirm" variant="primary" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
};

export default Dialog;
