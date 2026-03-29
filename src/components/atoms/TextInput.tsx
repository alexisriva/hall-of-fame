import type { FC } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: "text" | "number" | "email" | "password";
}

const TextInput: FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  autoFocus,
  type = "text",
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    autoFocus={autoFocus}
    className="w-full rounded-xl bg-[#161C29] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none border-none focus:ring-1 focus:ring-[#b22200]/50 transition-all"
  />
);

export default TextInput;
