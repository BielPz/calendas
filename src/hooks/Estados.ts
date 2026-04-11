import { useEffect, useState } from "react";

type Estado = {
  id: number;
  nome: string;
  sigla: string;
};

function Estados() {
  const [estados, setEstados] = useState<{ label: string; value: string }[]>(
    [],
  );

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => res.json())
      .then((data: Estado[]) => {
        // Ordena por nome
        const ordenados = data
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((estado) => ({
            label: `${estado.nome} (${estado.sigla})`,
            value: estado.sigla,
          }));

        setEstados(ordenados);
      });
  }, []);

  return estados;
}

export default Estados;
