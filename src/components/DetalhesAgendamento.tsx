import { CalendarDays, Clock3, MapPin, MessageCircle, MessageSquareText, Phone, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Agendamento } from "../firebase/types";
import ModalBase from "./ModalBase";
import CardInformacao from "./CardInformacao";

interface Props { agendamento: Agendamento; tipoUsuario: "cliente" | "prestador"; onFechar: () => void; onCancelar?: (agendamento: Agendamento) => void; mostrarDadosPrivados?: boolean; }

export default function DetalhesAgendamento({ agendamento, tipoUsuario, onFechar, onCancelar, mostrarDadosPrivados = true }: Props) {
  const navigate = useNavigate();
  const data = new Date(`${agendamento.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const modalidade = agendamento.modalidadeAtendimento === "online" ? "Atendimento online" : agendamento.modalidadeAtendimento === "presencial-prestador" ? "Prestador vai até o cliente" : "Atendimento no estabelecimento";
  const idContato = tipoUsuario === "cliente" ? agendamento.idPrestador : agendamento.idCliente;
  return <ModalBase aberto titulo="Detalhes do agendamento" subtitulo={agendamento.servico.nome} onFechar={onFechar} rodape={(idContato || onCancelar) && <div className="flex flex-wrap justify-end gap-2">{idContato && <button type="button" onClick={() => navigate(`/mensagens?contato=${idContato}&nome=${encodeURIComponent(tipoUsuario === "prestador" ? agendamento.clienteNome ?? "Cliente" : "Prestador")}`)} className="ui-button-secondary inline-flex items-center gap-2"><MessageCircle size={17} /> Conversar</button>}{onCancelar && <button type="button" onClick={() => onCancelar(agendamento)} className="ui-button-danger inline-flex items-center gap-2"><Trash2 size={17} /> Cancelar agendamento</button>}</div>}>
    <div className="space-y-4">{tipoUsuario === "prestador" && <CardInformacao titulo="Cliente" valor={agendamento.clienteNome ?? "Cliente"} />}<div className="grid gap-3 sm:grid-cols-2"><CardInformacao titulo="Data" valor={data} icone={<CalendarDays size={17} />} /><CardInformacao titulo="Horário" valor={`${agendamento.horario} · ${agendamento.duracaoMinutos ?? agendamento.servico.duracao} ${agendamento.duracaoMinutos ? "minutos" : agendamento.servico.tempo}`} icone={<Clock3 size={17} />} /></div><CardInformacao titulo="Modalidade" valor={modalidade} icone={<MapPin size={17} />} />{tipoUsuario === "prestador" && agendamento.telefoneContato && <CardInformacao titulo="Telefone para contato" valor={agendamento.telefoneContato} icone={<Phone size={17} />} />}{tipoUsuario === "prestador" && agendamento.enderecoCliente && <CardInformacao titulo="Endereço do cliente" valor={agendamento.enderecoCliente} icone={<MapPin size={17} />} />}{mostrarDadosPrivados && agendamento.obs && <CardInformacao titulo="Observação" valor={agendamento.obs} icone={<MessageSquareText size={17} />} />}</div>
  </ModalBase>;
}
