import { useState } from "react";

interface Props {
  label: string;
}

function UploadImagem({ label }: Props) {
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-1">{label}</label>

      <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100">
        {/* Botão */}
        <label className="bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400 transition">
          Selecionar imagem
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
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
