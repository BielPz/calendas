import { useState } from "react";
import CampoImagem from "./CampoImagem";

interface Props {
  label: string;
  onUpload: (url: string) => void;
}

function UploadImagem({ label, onUpload }: Props) {
  const [url, setUrl] = useState<string>();

  return (
    <CampoImagem
      label={label}
      imagemAtual={url}
      onUpload={(u) => {
        setUrl(u);
        onUpload(u);
      }}
    />
  );
}

export default UploadImagem;
