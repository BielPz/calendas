import { useTheme } from "../provider/ThemeContext";

export function useGradiente() {
  const { darkMode } = useTheme();
  return darkMode
    ? "bg-gradient-to-br from-indigo-950 to-zinc-950"
    : "bg-gradient-to-br from-orange-400 to-purple-400";
}
