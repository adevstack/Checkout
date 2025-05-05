import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    localStorage.getItem("theme") as Theme || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous classes
    root.classList.remove("light", "dark");
    
    // Determine which theme to apply
    let appliedTheme = theme;
    if (theme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    // Add the appropriate class
    root.classList.add(appliedTheme);
    
    // Store theme preference in localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}