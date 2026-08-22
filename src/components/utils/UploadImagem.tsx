import { uploadImage } from "@/cloudinary/upload";
import { useState } from "react";

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
