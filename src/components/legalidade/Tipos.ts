export type BlocoLegal =
  | { tipo: "secao"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "lista"; itens: string[] };
 
export interface DocumentoLegal {
  titulo: string;
  blocos: BlocoLegal[];
}