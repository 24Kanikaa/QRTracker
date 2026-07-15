import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

/* ---------------------------------------------------------
   Single source of truth for the teal/brass theme used
   across the admin section (sidebar + all admin pages).
--------------------------------------------------------- */
const LIGHT = {
  bg: "#F2F8F7",
  panel: "#FFFFFF",
  panel2: "#F6FBFA",
  hairline: "#E1EFEC",
  hairlineSoft: "#EDF6F4",
  text: "#12302C",
  muted: "#5E7D79",
  mutedSoft: "#93B0AC",
  brass: "#14B8A6",
  brassSoft: "#14B8A61A",
  rose: "#F43F5E",
  roseSoft: "#F43F5E1A",
  green: "#10B981",
  greenSoft: "#10B9811A",
  amber: "#D97706",
  amberSoft: "#D977061A",
  sky: "#0EA5E9",
  violet: "#8B5CF6",
  tooltipBg: "#12302C",
  tooltipText: "#F2F8F7",
  tooltipMuted: "#B7D6D1",
  cardShadow: "0 1px 2px rgba(18,48,44,0.04)",
  clockGradient: null,
  clockAccent: "#14B8A6",
  clockShadow: "0 1px 2px rgba(18,48,44,0.04)",
  clockText: "#12302C",
  clockDate: "#93B0AC",
};

const DARK = {
  bg: "#07211D",
  panel: "#0E322D",
  panel2: "#0B2824",
  hairline: "#1D5148",
  hairlineSoft: "#153E37",
  text: "#EAF7F3",
  muted: "#8FC7BC",
  mutedSoft: "#5C978B",
  brass: "#2DD4BF",
  brassSoft: "#2DD4BF26",
  rose: "#F97362",
  roseSoft: "#F9736226",
  green: "#4ADE9A",
  greenSoft: "#4ADE9A26",
  amber: "#F0B860",
  amberSoft: "#F0B86026",
  sky: "#38BDF8",
  violet: "#A78BFA",
  tooltipBg: "#0B2824",
  tooltipText: "#EAF7F3",
  tooltipMuted: "#8FC7BC",
  cardShadow: "0 1px 2px rgba(0,0,0,0.3)",
  clockGradient: "linear-gradient(135deg, #0F5C52 0%, #0E7A6D 55%, #16A599 100%)",
  clockAccent: "#FFE8B8",
  clockShadow: "0 8px 24px rgba(45,212,191,0.18)",
  clockText: "#FFFFFF",
  clockDate: "#D7F3EC",
};

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  const C = dark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, C }}>
      {children}
    </ThemeContext.Provider>
  );
}
