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
  requerAprovacao?: boolean;
}

export interface AvaliacaoServico {
  nota: number;
  comentario: string;
  atualizadoEm: number;
  nomeAutor?: string;
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
  /** Índice interno para validar os vínculos de conflito nas regras do Firebase. */
  servicosConflitantesMapa?: Record<string, true>;
  servico: Servico;
  data: string;
  horario: string;
  obs: string;
  telefoneContato?: string;
  enderecoCliente?: string;
  modalidadeAtendimento?: ModalidadeAtendimento;
  duracaoMinutos?: number;
  status?: "pendente" | "aguardando_aprovacao" | "agendado" | "recusado" | "concluido" | "cancelado";
}

export interface Notificacao {
  id?: string;
  titulo: string;
  mensagem: string;
  tipo: "agendamento" | "favorito" | "sistema" | "mensagem";
  criadoEm: number;
  lida?: boolean;
  idAgendamento?: string;
  idServico?: string;
  manterAposEncerramento?: boolean;
  idConversa?: string;
}

export interface MensagemChat {
  id?: string;
  autorId: string;
  texto: string;
  enviadoEm: number;
}

export interface ConversaChat {
  id: string;
  participantes: { cliente: string; prestador: string };
  nomes: { cliente: string; prestador: string };
  imagens?: { cliente?: string | null; prestador?: string | null };
  criadoEm: number;
  atualizadoEm: number;
  ultimaMensagem?: { texto: string; autorId: string; enviadoEm: number };
  ultimaLeitura?: Record<string, number>;
}

export interface Disponibilidade {
  [dia: number]: "sem-horario" | "parcial" | "disponivel";
}
