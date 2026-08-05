import { memo, useEffect, useState } from "react";
import type { Servico } from "../../firebase/types";
import { getEmpresaPorId } from "../../features/empresas/empresa.service";
import { toggleFavorito } from "../../features/perfil/perfil.service";
import ImagemServico from "../ImagemServico";
import { useAlerta } from "../../provider/AlertContext";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { salvarAvaliacaoServico } from "../../features/servicos/servico.service";
import ModalAvaliacao from "./ModalAvaliacao";

interface Props {
  servico: Servico;
  favoritoInicial?: boolean;
  onFavoritoChange?: (idServico: string, favoritado: boolean) => void;
  onAvaliacaoChange?: (idServico: string, nota: number, comentario: string) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function ServicoItem({ servico, favoritoInicial = false, onFavoritoChange, onAvaliacaoChange }: Props) {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [hover, setHover] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [notaInicialModal, setNotaInicialModal] = useState(0);
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const { showAlerta } = useAlerta();
  const navigate = useNavigate();

  // Sincroniza se o pai mudar favoritoInicial (ex: carregamento inicial)
  useEffect(() => {
    setFavorito(favoritoInicial);
  }, [favoritoInicial]);

  useEffect(() => {
    const avaliacaoAtual = servico.avaliacoes?.[getAuth().currentUser?.uid ?? ""];
    setAvaliacao(avaliacaoAtual?.nota ?? 0);
    setComentarioAvaliacao(avaliacaoAtual?.comentario ?? "");
  }, [servico.avaliacoes]);

  useEffect(() => {
    if (servico.idEmpresa) {
      getEmpresaPorId(servico.idEmpresa)
        .then((empresa) => setNomeEmpresa(empresa?.nome ?? ""))
        .catch((err) => {
          console.error("Erro ao carregar dados da empresa:", err);
          showAlerta("Erro", "Não foi possível carregar os dados da empresa.", "erro");
        });
    }
  }, [servico.idEmpresa, showAlerta]);

  const handleFavorito = async () => {
    if (!servico.id) return;
    try {
      const novoEstado = await toggleFavorito(servico.id);
      setFavorito(novoEstado);
      onFavoritoChange?.(servico.id, novoEstado);
    } catch {
      showAlerta("Erro", "Não foi possível atualizar favorito.", "erro");
    }
  };

  const abrirAvaliacao = (nota: number) => {
    if (!servico.id) return;
    setNotaInicialModal(nota);
    setModalAberto(true);
  };

  const abrirDetalhes = () => {
    if (servico.id) navigate(`/servicos/${servico.id}`);
  };

  const salvarAvaliacao = async (nota: number, comentario: string) => {
    if (!servico.id) return;
    try {
      setSalvandoAvaliacao(true);
      await salvarAvaliacaoServico(servico.id, nota, comentario);
      setAvaliacao(nota);
      setComentarioAvaliacao(comentario.trim());
      onAvaliacaoChange?.(servico.id, nota, comentario.trim());
      setModalAberto(false);
      showAlerta("Avaliação salva", "Sua avaliação foi registrada.", "sucesso");
    } catch (error) {
      showAlerta("Erro", error instanceof Error ? error.message : "Não foi possível salvar sua avaliação.", "erro");
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  const estrelas = (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((e) => (
        <button key={e} type="button" onClick={(event) => { event.stopPropagation(); abrirAvaliacao(e); }} onMouseEnter={() => setHover(e)} onMouseLeave={() => setHover(0)} className="text-lg leading-none transition-transform hover:scale-110" aria-label={`Avaliar com ${e} estrelas`}>
          <span className={(hover || avaliacao) >= e ? "text-yellow-400" : "text-gray-300 dark:text-zinc-600"}>★</span>
        </button>
      ))}
    </div>
  );

  const resumoAvaliacao = servico.totalAvaliacoes ? (
    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
      {servico.avaliacaoMedia?.toFixed(1)} ({servico.totalAvaliacoes})
    </span>
  ) : null;

  const botaoFavorito = (
    <button
      onClick={(event) => {
        event.stopPropagation();
        handleFavorito();
      }}
      className={`text-base shrink-0 pt-0.5 transition-colors ${favorito ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
    >
      {favorito ? "♥" : "♡"}
    </button>
  );

  return (
    <>
      {modalAberto && <ModalAvaliacao aberto notaInicial={notaInicialModal || avaliacao} comentarioInicial={comentarioAvaliacao} nomeServico={servico.nome} salvando={salvandoAvaliacao} onFechar={() => setModalAberto(false)} onSalvar={salvarAvaliacao} />}
      {/* ── DESKTOP (md+) ─────────────────────────────────────────────── */}
      <div onClick={abrirDetalhes} className="ui-card hidden w-full cursor-pointer flex-row overflow-hidden md:flex">
        <ImagemServico src={servico.imagem} alt={servico.nome} className="w-24 shrink-0 self-stretch" />

        <div className="flex-1 min-w-0 px-3 py-2 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">{servico.nome}</p>
              <button onClick={(event) => { event.stopPropagation(); navigate(`/empresas/${servico.idEmpresa}`); }} className="block truncate text-xs text-orange-700 dark:text-orange-300">{nomeEmpresa}</button>
            </div>
            {botaoFavorito}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed flex-1">
            {servico.descricao || "Sem descrição."}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">R$ {Number(servico.preco).toFixed(2)}</span>
            <span className="text-gray-300 dark:text-zinc-600 text-xs">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{servico.duracao} {servico.tempo}</span>
            <span className="text-gray-300 dark:text-zinc-600 text-xs">•</span>
            {estrelas}
            {resumoAvaliacao}
            <button
              className="ui-button-primary ml-auto px-3 py-1.5 text-xs"
              onClick={(event) => { event.stopPropagation(); navigate("/agendamento", { state: { servico, empresa: nomeEmpresa } }); }}
            >
              + Agendar
            </button>
          </div>
        </div>

        <div className="shrink-0 border-l border-gray-100 dark:border-zinc-700 px-3 py-2 flex flex-col gap-0.5 justify-center">
          {DIAS_SEMANA.map((dia, i) => {
            const d = servico.diasDisponiveis?.[i];
            const ativo = !!d?.ativo;
            return (
              <div key={dia} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0
                  ${ativo ? "bg-linear-to-br from-orange-500 to-violet-600 text-white" : "bg-gray-100 dark:bg-zinc-700 text-gray-400"}`}>
                  {dia}
                </div>
                <span className={`text-[10px] whitespace-nowrap ${ativo ? "text-gray-600 dark:text-gray-300" : "text-gray-300 dark:text-zinc-600"}`}>
                  {ativo ? `${d.inicio} – ${d.fim}` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE (< md) ─────────────────────────────────────────────── */}
      <div onClick={abrirDetalhes} className="ui-card flex w-full cursor-pointer flex-row overflow-hidden md:hidden">
        <ImagemServico src={servico.imagem} alt={servico.nome} className="w-20 shrink-0 self-stretch" />

        <div className="flex-1 min-w-0 px-3 py-2 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">{servico.nome}</p>
              <button onClick={(event) => { event.stopPropagation(); navigate(`/empresas/${servico.idEmpresa}`); }} className="block truncate text-xs text-orange-700 dark:text-orange-300">{nomeEmpresa}</button>
            </div>
            {botaoFavorito}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed flex-1">
            {servico.descricao || "Sem descrição."}
          </p>
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">R$ {Number(servico.preco).toFixed(2)}</span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">{servico.duracao} {servico.tempo}</span>
            </div>
            <button
              className="ui-button-primary shrink-0 px-3 py-1.5 text-xs"
              onClick={(event) => { event.stopPropagation(); navigate("/agendamento", { state: { servico, empresa: nomeEmpresa } }); }}
            >
              + Agendar
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {estrelas}
            {resumoAvaliacao}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ServicoItem);
