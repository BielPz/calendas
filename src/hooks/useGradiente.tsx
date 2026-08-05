import { useTheme } from "../provider/ThemeContext";

export function useGradiente() {
  const { darkMode } = useTheme();
  return darkMode
    ? "bg-linear-to-br from-zinc-950 via-zinc-900 to-violet-950"
    : "bg-linear-to-br from-orange-400 to-violet-500";
}
