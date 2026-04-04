import { useEffect, useState } from "react";

type Municipio = {
  id: number;
  nome: string;
};

function useCidades(UF: string) {
  const [cidades, setCidades] = useState<{ label: string; value: string }[]>(
    [],
  );

  useEffect(() => {
    if (!UF) return;

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF}/municipios`,
    )
      .then((res) => res.json())
      .then((data: Municipio[]) => {
        const ordenados = data
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((municipio) => ({
            label: municipio.nome,
            value: municipio.nome,
          }));

        setCidades(ordenados);
      });
  }, [UF]);

  return cidades;
}

export default useCidades;
