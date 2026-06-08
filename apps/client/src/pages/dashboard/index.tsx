import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/theme";
import { formatDuration } from "../../utils/formatDuration";

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
  accent: string;
}

function StatCard({ label, value, sublabel, icon, warning }: {
  label: string; value: string; sublabel?: string; icon: React.ReactNode; warning?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg p-6 flex flex-col gap-3 flex-1 du-fade"
      style={{
        background: C.cardBg,
        border: `1px solid ${warning ? C.warn : C.border}`,
        boxShadow: warning ? `0 0 18px -4px ${C.warnGlow}` : "none",
      }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full" style={{ background: warning ? C.warn : C.accent, opacity: 0.05 }} />
      <div className="flex items-center gap-2" style={{ color: warning ? C.warn : C.muted }}>
        {icon}
        <span className="text-xs font-semibold tracking-wider uppercase">{label}</span>
      </div>
      <div className="font-mono text-4xl font-bold tracking-wider leading-tight" style={{ color: warning ? C.warn : C.fg }}>
        {value}
      </div>
      {sublabel && <div className="text-sm" style={{ color: C.muted }}>{sublabel}</div>}
      <div className="flex items-center gap-1.5 mt-auto">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: warning ? C.warn : C.accent }} />
        <span className="text-xs" style={{ color: C.muted }}>{warning ? "Threshold reached" : "Live"}</span>
      </div>
    </div>
  );
}

function NavButton({ icon, label, sublabel, onClick, accent }: NavButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full text-left rounded-lg p-5 flex items-center gap-4 overflow-hidden cursor-pointer transition-all duration-200 du-fade"
      style={{
        background: hovered ? `${accent}14` : C.cardBg,
        border: `1px solid ${hovered ? accent : C.border}`,
        boxShadow: hovered ? `0 0 20px -6px ${accent}88` : "none",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-r transition-opacity duration-200"
        style={{ background: accent, opacity: hovered ? 1 : 0 }}
      />
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg transition-all duration-200"
        style={{
          background: hovered ? `${accent}28` : C.surface,
          color: hovered ? accent : C.muted,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold tracking-wider transition-colors duration-200" style={{ color: hovered ? accent : C.fg }}>
          {label}
        </div>
        <div className="text-xs mt-0.5 truncate" style={{ color: C.muted }}>
          {sublabel}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 transition-all duration-200" style={{ color: hovered ? accent : C.border, transform: hovered ? "translateX(2px)" : "none" }}>
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [inactivitySeconds, setInactivitySeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Listen for idle time from Electron's powerMonitor
    const handleIdleTime = (_event: any, idleSeconds: number) => {
      setInactivitySeconds(idleSeconds);
    };

    window.ipcRenderer.on('idle-time', handleIdleTime);
    return () => {
      window.ipcRenderer.off('idle-time', handleIdleTime);
    };
  }, []);

  const INACTIVITY_WARN = 120;
  const isInactive = inactivitySeconds >= INACTIVITY_WARN;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono { font-family: 'Share Tech Mono', monospace; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .du-fade { animation: fadeInUp 0.45s ease both; }
        .du-d1{animation-delay:.08s} .du-d2{animation-delay:.16s} .du-d3{animation-delay:.24s}
        .du-d4{animation-delay:.32s} .du-d5{animation-delay:.40s}
        .du-root { font-family: 'DM Sans', sans-serif; background: #0a0c10; color: #e2e8f2; min-height: 100vh; display: flex; flex-direction: column;
          background-image: linear-gradient(rgba(255,140,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,0.025) 1px,transparent 1px);
          background-size: 32px 32px; }
      `}</style>

      <div className="du-root">
        <main className="flex-1 px-8 py-8 max-w-3xl mx-auto w-full md:px-8 sm:px-4">
          {/* Title row */}
          <div className="du-fade du-d1 du-title-row flex flex-col text-center items-center justify-center sm:flex-row sm:text-left sm:items-end sm:justify-between mb-7">
            <div>
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: C.muted }}>Workstation</div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.fg }}>
                Terminal{" "}
                <span className="font-mono" style={{ color: C.accent }}>#PC-04</span>
              </h1>
            </div>
          </div>

          {/* Stat cards */}
          <div className="du-fade du-d2 du-stat-cards flex flex-col sm:flex-row gap-4 mb-7">
            <StatCard
              label="Session Duration"
              value={formatDuration(sessionSeconds)}
              sublabel="Time since session started"
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
            />
            <StatCard
              label="Inactivity Timer"
              value={formatDuration(inactivitySeconds)}
              sublabel={isInactive ? `Idle for over ${Math.floor(INACTIVITY_WARN / 60)} minutes` : "Time since last input"}
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.1 4.1l1.4 1.4M10.5 10.5l1.4 1.4M4.1 11.9l1.4-1.4M10.5 5.5l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>}
              warning={isInactive}
            />
          </div>

          {/* Divider */}
          <div className="du-fade du-d3 flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: C.border }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: C.muted }}>Quick Actions</span>
            <div className="flex-1 h-px" style={{ background: C.border }} />
          </div>

          {/* Nav buttons */}
          <div className="du-nav-buttons flex flex-col gap-2.5 md:gap-2">
            <div className="du-fade du-d4">
              <NavButton
                icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 3H3a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 3 15h12a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 15 3Z" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 6h15M6 10.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                label="Send Report" sublabel="Submit an issue or incident report"
                onClick={() => navigate("/send-report")} accent={C.warn}
              />
            </div>
          </div>
        </main>

        <footer className="px-8 py-3 border-t flex flex-col text-center gap-2 sm:flex-row sm:text-left sm:justify-between sm:items-center sm:gap-0 text-xs sm:px-4" style={{ borderColor: C.border }}>
          <span style={{ color: C.muted }}>Euldans Client v1.0.0</span>
          <span style={{ color: C.muted }}>
            Created by <a href="https://github.com/revieqt" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: C.muted }}>Joshua Opsima</a>
          </span>
        </footer>
      </div>
    </>
  );
}