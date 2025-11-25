// src/components/ui/ThemeToggle.tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toggleTheme = (event: React.MouseEvent) => {
    const isLight = theme === "light";
    
    const x = event.clientX;
    const y = event.clientY;

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(isLight ? "dark" : "light");
      return;
    }

    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);

    // @ts-ignore
    document.startViewTransition(() => {
      setTheme(isLight ? "dark" : "light");
    });
  };

  if (!mounted) {
    return <div className="h-8 w-14" />; // Reduced placeholder
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-14 rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-bankii-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      style={{
        backgroundColor: isLight ? '#e5e7eb' : '#0049FF', // Light gray / Bankii blue
      }}
      aria-label="Toggle light/dark mode"
    >
      {/* Sliding Pill with Icon */}
      <motion.div
        className="relative h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: isLight ? 0 : 24, // Reduced slide distance
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Single Icon with smooth swap animation */}
        <AnimatePresence mode="wait" initial={false}>
          {isLight ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <FaSun className="h-3.5 w-3.5 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <FaMoon className="h-3.5 w-3.5 text-blue-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}