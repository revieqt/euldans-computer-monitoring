import { useNavigate } from "react-router-dom";
import DigitalClock from "./Clock";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="du-fade sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-8 py-3 sm:py-3.5 border-b border-[#1e2433] bg-[rgba(10,12,16,0.92)] backdrop-blur-md">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 self-center sm:self-auto"
      >
        <img src="/icon.png" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8" />

        <div className="text-left">
          <div className="text-sm font-semibold tracking-wide text-[#e2e8f2]">
            Euldans Internet Cafe
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-[#4a566e]">
            Monitoring System
          </div>
        </div>
      </button>

      <div className="flex items-center justify-center sm:justify-end flex-wrap gap-4">
        <DigitalClock />
      </div>
    </header>
  );
}