import { useState } from "react";
import { uploadImage } from "../cloudinary/upload";

interface Props {
  label: string;
  onUpload: (url: string) => void; // Função de callback para receber a URL da imagem após o upload
}

function UploadImagem({ label, onUpload }: Props) {
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [loading, setLoading] = useState(false); // Estado para indicar se o upload está em andamento

  // Função para lidar com a seleção do arquivo e fazer o upload
  const handleFile = async (file: File) => {
    setLoading(true);

    const url = await uploadImage(file); // Fazemos o upload da imagem e obtemos a URL

    // Atualizamos o nome do arquivo e chamamos a função de callback com a URL da imagem
    setFileName(file.name);
    onUpload(url); // Passamos a URL da imagem para o componente pai

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-200">{label}</label>

      <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {/* Botão */}
        <label className="cursor-pointer bg-orange-50 px-4 py-3 font-semibold text-orange-700 transition hover:bg-orange-100 dark:bg-orange-400/10 dark:text-orange-200 dark:hover:bg-orange-400/20">
          {loading ? "Enviando..." : "Selecionar imagem"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {/* Nome do arquivo */}
        <span className="truncate px-3 text-sm text-slate-600 dark:text-zinc-300">{fileName}</span>
      </div>
    </div>
  );
}

export default UploadImagem;
