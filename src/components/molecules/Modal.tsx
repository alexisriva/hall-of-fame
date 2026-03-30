import type { FC, ReactNode } from "react";
import { HiXMark } from "react-icons/hi2";

const sizeClasses = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: keyof typeof sizeClasses;
}

const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children, size = "md" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#10141E] p-5 sm:p-6 flex flex-col gap-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <HiXMark size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
