"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2 transition-colors transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.6,1)]">
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-colors transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.6,1)] ${
          theme === "dark"
            ? "text-gray-500 scale-75 rotate-12"
            : "text-amber-500 scale-100 rotate-0"
        }`}
      />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="transition-colors transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.6,1)] hover:scale-110"
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-colors transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.6,1)] ${
          theme === "light"
            ? "text-gray-500 scale-75 rotate-12"
            : "text-blue-400 scale-100 rotate-0"
        }`}
      />
    </div>
  );
}
