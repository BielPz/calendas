export interface Usuario {
  email: string;
  senha: string;
  rSenha: string;

  nome: string;
  genero: string;
  dtnasc: string;
  telefone?: string;

  tipo: string;
}

export interface Cliente {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Prestador {
  // add algo depois?
}

export interface Empresa {
  nome: string;
  cnpj: string;
  tel: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  imagem?: string;
}

export interface Servico {
  id?: string;
  idEmpresa?: string;
  cnpj: string;
  nome: string;
  banner?: string;
  descricao?: string;
  preco: number;
  inicio: string;
  fim: string;
  duracao: string;
}

export interface Agendamento {
  id?: string;
  servico: string;
  data: string;
  horario: string;
  obs: string;
}
