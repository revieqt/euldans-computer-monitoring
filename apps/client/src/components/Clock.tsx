import { useState, useEffect } from "react";

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-center sm:text-right">
      <div className="font-mono text-sm font-bold tracking-widest leading-none text-[#ff8c00]"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        {time.toLocaleTimeString("en-US", { hour12: false })}
      </div>
      <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-[#4a566e]"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}