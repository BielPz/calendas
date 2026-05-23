import { useEffect, useState } from "react";
import type { Servico } from "../../firebase/types";
import { getEmpresaPorId } from "../../firebase/database";
import imgErrorInternet from "../../images/erroInternet.jpg";
import { useAlerta } from "../../provider/AlertContext";
import { useNavigate } from "react-router";

interface Props {
  servico: Servico;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function ServicoItem({ servico }: Props) {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [avaliacao, setAvaliacao] = useState(0);
  const [hover, setHover] = useState(0);
  const { showAlerta } = useAlerta();
  const navigate = useNavigate();

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

  const estrelas = (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((e) => (
        <button key={e} onClick={() => setAvaliacao(e)} onMouseEnter={() => setHover(e)} onMouseLeave={() => setHover(0)} className="text-sm leading-none">
          <span className={(hover || avaliacao) >= e ? "text-yellow-400" : "text-gray-300 dark:text-zinc-600"}>★</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP (md+) ─────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-row w-full bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">

        {/* Imagem */}
        <div className="w-24 shrink-0 bg-gray-100 dark:bg-zinc-900 self-stretch">
          {servico.imagem ? (
            <img src={servico.imagem} alt={servico.nome} className="w-full h-full object-cover" loading="lazy"
              onError={(e) => { e.currentTarget.src = imgErrorInternet; }} />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-zinc-700" />
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0 px-3 py-2 flex flex-col">
          {/* Topo: nome + favorito */}
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">{servico.nome}</p>
              <p className="text-xs text-blue-500 truncate">{nomeEmpresa}</p>
            </div>
            <button onClick={() => setFavorito(!favorito)} className="text-base shrink-0 pt-0.5 text-gray-400 hover:text-red-400 transition-colors">
              {favorito ? "♥" : "♡"}
            </button>
          </div>

          {/* Descrição cresce para empurrar o rodapé */}
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed flex-1">
            {servico.descricao || "Sem descrição."}
          </p>

          {/* Rodapé: preço, duração, estrelas, botão */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">R$ {Number(servico.preco).toFixed(2)}</span>
            <span className="text-gray-300 dark:text-zinc-600 text-xs">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{servico.duracao} {servico.tempo}</span>
            <span className="text-gray-300 dark:text-zinc-600 text-xs">•</span>
            {estrelas}
            <button
              className="ml-auto text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors"
              onClick={() => navigate("/agendamento", { state: { servico, empresa: nomeEmpresa } })}
            >
              + Agendar
            </button>
          </div>
        </div>

        {/* Dias */}
        <div className="shrink-0 border-l border-gray-100 dark:border-zinc-700 px-3 py-2 flex flex-col gap-0.5 justify-center">
          {DIAS_SEMANA.map((dia, i) => {
            const d = servico.diasDisponiveis?.[i];
            const ativo = !!d?.ativo;
            return (
              <div key={dia} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0
                  ${ativo ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-zinc-700 text-gray-400"}`}>
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
      <div className="flex md:hidden flex-row w-full bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">

        {/* Imagem */}
        <div className="w-20 shrink-0 bg-gray-100 dark:bg-zinc-900 self-stretch">
          {servico.imagem ? (
            <img src={servico.imagem} alt={servico.nome} className="w-full h-full object-cover" loading="lazy"
              onError={(e) => { e.currentTarget.src = imgErrorInternet; }} />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-zinc-700" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-3 py-2 flex flex-col">
          {/* Topo */}
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">{servico.nome}</p>
              <p className="text-xs text-blue-500 truncate">{nomeEmpresa}</p>
            </div>
            <button onClick={() => setFavorito(!favorito)} className="text-base shrink-0 pt-0.5 text-gray-400 hover:text-red-400 transition-colors">
              {favorito ? "♥" : "♡"}
            </button>
          </div>

          {/* Descrição */}
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed flex-1">
            {servico.descricao || "Sem descrição."}
          </p>

          {/* Rodapé */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">R$ {Number(servico.preco).toFixed(2)}</span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">{servico.duracao} {servico.tempo}</span>
            </div>
            <button
              className="shrink-0 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors"
              onClick={() => navigate("/agendamento", { state: { servico, empresa: nomeEmpresa } })}
            >
              + Agendar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServicoItem;