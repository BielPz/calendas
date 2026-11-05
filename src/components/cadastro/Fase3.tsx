import { useEffect, useState } from "react";
import CheckBox from "../utils/CheckBox";
import Formulario from "../utils/Formulario";
import DocumentoLegalView from "../legalidade/DocumentoLegalView";
import { politicaPrivacidade } from "../legalidade/PoliticaPrivacidade";
import { termosUso } from "../legalidade/TermosUso";

interface Props {
  onValidate?: (valid: boolean) => void;
}

type Aba = "termos" | "privacidade";

function Fase3({ onValidate }: Props) {
  const [aba, setAba] = useState<Aba>("termos");

  const [checks, setChecks] = useState({
    termos: false,
    notificacoes: false,
  });

  useEffect(() => {
    onValidate?.(checks.termos); // só termos obrigatório
  }, [checks]);

  const abaClasse = (ativa: boolean) =>
    `px-4 py-2 rounded-t-xl font-semibold border border-b-0 ${
      ativa
        ? "border-gray-400 bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        : "border-transparent text-gray-500 dark:text-zinc-400"
    }`;

  return (
    <>
      <Formulario>
        <h1 className="font-bold text-4xl py-6">Termos de Uso e Privacidade</h1>
        <div className="flex gap-1">
          <button
            type="button"
            className={abaClasse(aba === "termos")}
            onClick={() => setAba("termos")}
          >
            Termos de Uso
          </button>
          <button
            type="button"
            className={abaClasse(aba === "privacidade")}
            onClick={() => setAba("privacidade")}
          >
            Política de Privacidade
          </button>
        </div>
        <div className="overflow-auto h-70 border p-3 border-gray-400 rounded-xl rounded-tl-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
          <DocumentoLegalView
            documento={aba === "termos" ? termosUso : politicaPrivacidade}
          />
        </div>
        <CheckBox
          message="Li e aceito os Termos de Uso e a Política de Privacidade"
          onChange={(e) =>
            setChecks((prev) => ({ ...prev, termos: e.target.checked }))
          }
        />
        <CheckBox
          message="Gostaria de receber e-mail e notificações do site"
          onChange={(e) =>
            setChecks((prev) => ({ ...prev, notificacoes: e.target.checked }))
          }
        />
      </Formulario>
    </>
  );
}

export default Fase3;
