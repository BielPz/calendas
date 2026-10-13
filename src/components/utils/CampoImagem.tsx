import { uploadImage } from "@/cloudinary/upload";
import { useState } from "react";

interface Props {
  label: string;
  imagemAtual?: string;
  onUpload: (url: string) => void;
}

function CampoImagem({ label, imagemAtual, onUpload }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");

  const enviar = async (file: File) => {
    try {
      setEnviando(true);
      setErro("");
      setNomeArquivo(file.name);
      onUpload(await uploadImage(file));
    } catch {
      setNomeArquivo("");
      setErro("Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-200">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
        <label className="ui-button-secondary shrink-0 cursor-pointer text-sm">
          {enviando ? "Enviando..." : "Selecionar imagem"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={enviando}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) enviar(file);
              event.target.value = "";
            }}
          />
        </label>

        {imagemAtual && (
          <img
            src={imagemAtual}
            alt="Prévia"
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        )}

        {nomeArquivo && (
          <span
            className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-zinc-300"
            title={nomeArquivo}
          >
            {nomeArquivo}
          </span>
        )}
      </div>
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

export default CampoImagem;
