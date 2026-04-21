import { useState } from "react";
import { uploadImage } from "../cloudinary/upload";

interface Props {
  label: string;
  onUpload: (url: string) => void;
}

function UploadImagem({ label, onUpload }: Props) {
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);

    const url = await uploadImage(file);

    setFileName(file.name);
    onUpload(url);

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-1">{label}</label>

      <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100">
        {/* Botão */}
        <label className="bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400 transition">
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
        <span className="px-3 text-sm text-gray-600 truncate">{fileName}</span>
      </div>
    </div>
  );
}

export default UploadImagem;
