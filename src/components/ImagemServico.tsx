import imgErrorInternet from "../images/erroInternet.jpg";
interface Props { src?: string; alt: string; className?: string; }
export default function ImagemServico({ src, alt, className = "" }: Props) { return <div className={`bg-slate-100 dark:bg-zinc-800 ${className}`}>{src ? <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.src = imgErrorInternet; }} /> : <div className="h-full w-full" />}</div>; }
