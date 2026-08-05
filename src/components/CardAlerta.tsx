import { AlertTriangle, Check, Info, WifiOff, X } from "lucide-react";
import ModalBase from "./ModalBase";
interface Props { aberto: boolean; type?: "sucesso" | "erro" | "desconect" | "aviso" | "info"; titulo: string; label: string; onClose: () => void; }
export default function CardAlerta({ aberto, type = "sucesso", titulo, label, onClose }: Props) {
  const icones = { sucesso: <Check size={30} />, erro: <X size={30} />, desconect: <WifiOff size={30} />, aviso: <AlertTriangle size={30} />, info: <Info size={30} /> };
  const cores = { sucesso: "bg-green-600", erro: "bg-red-600", desconect: "bg-slate-600", aviso: "bg-amber-500", info: "bg-violet-600" };
  return <ModalBase aberto={aberto} titulo={titulo} onFechar={onClose} className="max-w-sm" rodape={<button type="button" onClick={onClose} className="ui-button-primary w-full">OK</button>}><div className="flex flex-col items-center gap-4 text-center"><span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${cores[type]}`}>{icones[type]}</span><p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{label}</p></div></ModalBase>;
}
