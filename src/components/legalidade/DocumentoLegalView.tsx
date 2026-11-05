import type { ReactNode } from "react";
import type { DocumentoLegal } from "./Tipos";

// Converte **negrito** em <strong>
function renderInline(texto: string): ReactNode[] {
  return texto
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((parte, i) =>
      parte.startsWith("**") && parte.endsWith("**") ? (
        <strong key={i}>{parte.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{parte}</span>
      ),
    );
}

function DocumentoLegalView({ documento }: { documento: DocumentoLegal }) {
  return (
    <article className="flex flex-col gap-3 text-sm leading-relaxed">
      <h2 className="text-lg font-bold">{documento.titulo}</h2>
      {documento.blocos.map((b, i) => {
        switch (b.tipo) {
          case "secao":
            return (
              <h3 key={i} className="mt-3 text-base font-bold">
                {b.texto}
              </h3>
            );
          case "subtitulo":
            return (
              <h4 key={i} className="mt-1 font-semibold">
                {b.texto}
              </h4>
            );
          case "lista":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {b.itens.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{renderInline(b.texto)}</p>;
        }
      })}
    </article>
  );
}

export default DocumentoLegalView;
