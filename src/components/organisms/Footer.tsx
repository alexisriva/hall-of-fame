import { SiGithub } from "react-icons/si";
import avatar from "../../assets/avatar.png";
import CoffeeButton from "../atoms/CoffeeButton";

const Footer = () => (
  <footer className="flex flex-col items-center gap-3 text-xs py-8 tracking-widest text-white z-10">
    {import.meta.env.VITE_SHOW_COFFEE_BUTTON === "true" && (
      <div className="md:hidden">
        <CoffeeButton />
      </div>
    )}
    <div className="flex justify-center gap-3 items-center">
      <p className="opacity-40">
        Alexis Rivadeneira © {new Date().getFullYear()}
      </p>
      <div className="flex gap-2">
        <a
          href="https://alexisrivadeneira.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-colors text-sm font-medium uppercase tracking-wider flex items-center gap-2"
        >
          <img
            src={avatar}
            alt="Alexis Rivadeneira"
            title="Alexis Rivadeneira"
            style={{ width: 18, height: 18 }}
            className="rounded-full"
          />
        </a>
        <a
          href="https://github.com/alexisriva/hall-of-fame"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white hover:scale-110 transition-colors text-sm font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <SiGithub size={18} />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
