"use client";
import useTheme from "@/Hooks/useTheme";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={`p-2 rounded-full transition-colors ${
        isDark
          ? "hover:bg-slate-700 text-amber-300"
          : "hover:bg-slate-200 text-slate-700"
      }`}
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeToggle;
