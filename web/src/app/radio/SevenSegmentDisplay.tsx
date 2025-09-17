import React, { useState, useEffect } from "react";

// Helper to format the frequency string as 3 digits, dot, 2 decimals
function formatFrequencyDisplay(value: string) {
  // Remove all non-digit and non-dot chars
  let sanitized = value.replace(/[^0-9.]/g, "");
  const hasDot = sanitized.includes(".");
  let [intPart, decPart = ""] = sanitized.split(".");
  // Pad int part to 3, dec part to 2
  intPart = intPart.slice(0, 3); // never more than 3 digits
  const intPad = intPart.padStart(3, "0");
  const decPad = (decPart + "00").slice(0, 2);
  return { intPad, decPad, hasDot };
}

interface SevenSegmentDisplayProps {
  connected: boolean;
  value?: string;
  onChange?: (val: string) => void;
  button?: string | null;
  buttonEvent?: number;
}

const DEFAULT_SCREEN = "88.0";


export default function SevenSegmentDisplay({ connected, value = DEFAULT_SCREEN, onChange, button, buttonEvent }: SevenSegmentDisplayProps) {
  const [screen, setScreen] = useState<string>(value);

  useEffect(() => {
    setScreen(value);
  }, [value]);

  // Listen for button changes, even if the value is the same as before
  useEffect(() => {
    if (button == null) return;
    setScreen((prev) => {
      let next = prev;
      if (button === "R") {
        next = DEFAULT_SCREEN;
      } else if (button === ".") {
        if (!prev.includes(".") && prev.replace(/[^0-9]/g, "").length > 0) {
          next = prev + ".";
        }
      } else {
        let sanitized = prev.replace(/[^0-9.]/g, "");
        let [intPart, decPart = ""] = sanitized.split(".");
        if (!prev.includes(".")) {
          if (intPart.length >= 3) return prev;
        } else {
          if (decPart.length >= 2) return prev;
        }
        if (connected) return prev;
        next = prev === DEFAULT_SCREEN ? button : `${prev}${button}`;
      }
      if (onChange) onChange(next);
      return next;
    });
  }, [buttonEvent]);

  const { intPad, decPad, hasDot } = formatFrequencyDisplay(screen);
  // Dot is colored only if user entered a dot, or if connected and no decimals (simulate fixed freq)
  const dotActive = hasDot || (connected && !hasDot);

  return (
    <div className="relative mx-auto flex h-20 w-full max-w-xs sm:h-24 sm:max-w-md items-center justify-center rounded-xl border border-emerald-400/40 bg-gradient-to-b from-slate-950 to-slate-900 text-4xl sm:text-6xl font-seven-segment tracking-[0.25em] sm:tracking-[0.35em] text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
      <span className="tabular-nums flex items-center">
        {/* Integer part with grayed leading zeros */}
        {intPad.split("").map((d, i) => (
          <span key={i} className={d === "0" && i < intPad.search(/[^0]/) ? "text-emerald-900" : ""}>{d}</span>
        ))}
        <span className={dotActive ? "mx-1" : "mx-1 text-emerald-900"}>.</span>
        {/* Decimal part, always 2 digits */}
        <span>{decPad}</span>
      </span>
      <span className="sr-only">{connected ? "Connected" : "Disconnected"}</span>
      {/* MHz label bottom right */}
      <span className="absolute bottom-1 right-2 sm:bottom-2 sm:right-4 text-[10px] sm:text-xs text-emerald-400/70 font-mono select-none tracking-tight" style={{ letterSpacing: '-0.08em' }}>MHz</span>
    </div>
  );
}
