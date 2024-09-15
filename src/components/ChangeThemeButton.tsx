"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export default function ChangeThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      size="icon"
      onClick={() => {
        theme === "light" ? setTheme("dark") : setTheme("light");
      }}
    >
      <SunIcon className="size-5 transition-all dark:opacity-0 dark:translate-y-5" />
      <MoonIcon className="size-5 absolute transition-all opacity-0 -translate-y-5 dark:opacity-100 dark:translate-y-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
