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

export type ModalidadeAtendimento =
  | "presencial-cliente"
  | "presencial-prestador"
  | "online";

export interface ConfiguracaoAtendimento {
  modalidade: ModalidadeAtendimento;
  solicitarTelefone: boolean;
  placeholderObservacao: string;
  observacaoObrigatoria?: boolean;
}

export interface AvaliacaoServico {
  nota: number;
  comentario: string;
  atualizadoEm: number;
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
  configuracaoAtendimento?: ConfiguracaoAtendimento;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  avaliacoes?: Record<string, AvaliacaoServico>;
  modoHorario?: "duracao" | "livre";
  visibilidadeAgenda?: "dia" | "todos" | "oculta";
  servicosConflitantes?: string[];
  diasDisponiveis: DiaDisponivel[]; // [Dom, Seg, Ter, Qua, Qui, Sex, Sáb]
}

export interface Agendamento {
  id?: string;
  idCliente?: string;
  idServico?: string;
  idEmpresa?: string;
  idPrestador?: string;
  clienteNome?: string;
  servicosConflitantes?: string[];
  servico: Servico;
  data: string;
  horario: string;
  obs: string;
  telefoneContato?: string;
  enderecoCliente?: string;
  duracaoMinutos?: number;
  status?: "pendente" | "agendado" | "concluido" | "cancelado";
}

export interface Disponibilidade {
  [dia: number]: "sem-horario" | "parcial" | "disponivel";
}
