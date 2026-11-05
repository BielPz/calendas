import type { Agendamento } from "@/firebase/types";

export type StatusAgendamento = NonNullable<Agendamento["status"]>;

export const ROTULO_STATUS: Record<StatusAgendamento, string> = {
  pendente: "Pendente",
  aguardando_aprovacao: "Aguardando aprovação",
  agendado: "Agendado",
  recusado: "Recusado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const COR_STATUS: Record<StatusAgendamento, string> = {
  pendente: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  aguardando_aprovacao: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  agendado: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  recusado: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  concluido: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelado: "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300",
};