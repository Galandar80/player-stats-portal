
import { Moon, Sun, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
    >
      <motion.div
        initial={{ rotate: isDark ? 90 : 0, opacity: isDark ? 0 : 1 }}
        animate={{ rotate: isDark ? 90 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-amber-600" />
      </motion.div>
      <motion.div
        initial={{ rotate: isDark ? 0 : -90, opacity: isDark ? 1 : 0 }}
        animate={{ rotate: isDark ? 0 : -90, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="h-[1.2rem] w-[1.2rem] text-amber-300" />
      </motion.div>
      <span className="sr-only">Cambia tema</span>
    </Button>
  );
}
