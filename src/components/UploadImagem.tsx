import CampoImagem from "./CampoImagem";
interface Props { label: string; onUpload: (url: string) => void; }
export default function UploadImagem({ label, onUpload }: Props) { return <CampoImagem label={label} onUpload={onUpload} />; }
