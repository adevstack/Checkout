import { useState, useEffect } from "react";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Matches Tailwind's sm breakpoint
    };
    
    checkIsMobile();
    
    // Add event listener
    window.addEventListener("resize", checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return isMobile;
}
