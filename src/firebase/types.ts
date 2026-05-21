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

// Adicionar o ID da empresa para facilitar consultas
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

export interface DiaDisponivel {
  ativo: boolean;
  inicio: string;
  fim: string;
}

export interface Servico {
  id?: string;
  idEmpresa?: string;
  cnpj: string;
  nome: string;
  imagem?: string;
  descricao?: string;
  preco: number;
  duracao: string;
  tempo: string;
  diasDisponiveis: DiaDisponivel[]; // [Dom, Seg, Ter, Qua, Qui, Sex, Sáb]
}

export interface Agendamento {
  id?: string;
  servico: Servico;
  data: string;
  horario: string;
  obs: string;
}
