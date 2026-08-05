import { useState } from "react";
import { uploadImage } from "../cloudinary/upload";

interface Props { label: string; imagemAtual?: string; onUpload: (url: string) => void; }

export default function CampoImagem({ label, imagemAtual, onUpload }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const enviar = async (file: File) => { try { setEnviando(true); setErro(""); onUpload(await uploadImage(file)); } catch { setErro("Não foi possível enviar a imagem."); } finally { setEnviando(false); } };
  return <div className="w-full max-w-md"><label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-200">{label}</label><div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">{imagemAtual && <img src={imagemAtual} alt="Prévia" className="h-10 w-10 rounded-lg object-cover" />}<label className="ui-button-secondary cursor-pointer text-sm">{enviando ? "Enviando..." : "Selecionar imagem"}<input type="file" accept="image/*" className="hidden" disabled={enviando} onChange={(event) => { const file = event.target.files?.[0]; if (file) enviar(file); }} /></label></div>{erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}</div>;
}
