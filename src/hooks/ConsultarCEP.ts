export interface CepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

function ConsultarCEP(cep: string): Promise<CepResponse | null> {
  return fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((res) => res.json())
    .catch(() => null);
}

export default ConsultarCEP;
