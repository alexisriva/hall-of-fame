import type { FC, ChangeEvent } from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TextArea: FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = "Add a note...",
  rows = 3,
}) => (
  <textarea
    value={value}
    rows={rows}
    placeholder={placeholder}
    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
    className="w-full resize-none bg-transparent border-none outline-none text-white/50 text-sm leading-relaxed placeholder:text-white/20 focus:text-white/70 transition-colors duration-200"
  />
);

export default TextArea;
