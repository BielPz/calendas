function ConsultarCEP(cep: string): Promise<any> {
  return fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((res) => res.json())
    .catch(() => null);
}

export default ConsultarCEP;