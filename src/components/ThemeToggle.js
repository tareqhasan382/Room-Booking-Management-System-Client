"use client";
import useTheme from "@/Hooks/useTheme";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex space-x-2">
      {theme === "light" ? (
        <button
          onClick={() => handleThemeChange("dark")}
          className={`px-3 py-2 rounded ${
            theme === "dark"
              ? "hover:bg-slate-800 text-white"
              : "hover:bg-slate-100 text-black"
          }`}
        >
          <Moon />
        </button>
      ) : (
        <button
          onClick={() => handleThemeChange("light")}
          className={`px-3 py-2 rounded ${
            theme === "light"
              ? "hover:bg-slate-100 text-black"
              : "hover:bg-slate-800 text-white"
          }`}
        >
          <Sun />
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;
