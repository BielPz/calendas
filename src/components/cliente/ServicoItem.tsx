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
  }, [servico.idEmpresa]);

  return (
    <div className="flex flex-row w-full bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden items-stretch border border-gray-200 dark:border-zinc-700 shadow-xs">
      
      {/* Imagem — Ocupa 100% da altura total da div de conteúdo */}
      <div className="w-52 shrink-0 bg-gray-200 dark:bg-zinc-900">
        {servico.imagem ? (
          <img
            src={servico.imagem}
            alt="banner do serviço"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = imgErrorInternet; }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center text-gray-500 text-sm">
            Sem Imagem
          </div>
        )}
      </div>

      {/* Grid de Conteúdo Dividido em Duas Colunas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
        
        {/* COLUNA 1: Dados do Serviço (Empresa, Descrição, Valor, etc.) */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xl dark:text-white truncate">{servico.nome}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mt-0.5">{nomeEmpresa}</p>
              </div>
              
              {/* Coração Antigo / Simples */}
              <button
                onClick={() => setFavorito(!favorito)}
                className="text-2xl transition-transform active:scale-90 cursor-pointer p-1 shrink-0"
              >
                {favorito ? "♥" : "♡"}
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mt-3 leading-relaxed">
              {servico.descricao || "Nenhuma descrição informada."}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {/* Bloco de Valor e Tempo */}
            <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-800 dark:text-gray-200 gap-5">
              <span className="bg-white dark:bg-zinc-700 px-3 py-1 rounded border border-gray-200 dark:border-zinc-600 shadow-xs">
                R$ {Number(servico.preco).toFixed(2)}
              </span>
              <span className="bg-white dark:bg-zinc-700 px-3 py-1 rounded border border-gray-200 dark:border-zinc-600 shadow-xs">
                {servico.duracao} {servico.tempo}
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  onClick={() => setAvaliacao(estrela)}
                  onMouseEnter={() => setHover(estrela)}
                  onMouseLeave={() => setHover(0)}
                  className="text-xl cursor-pointer transition-transform hover:scale-110"
                >
                  <span className={(hover || avaliacao) >= estrela ? "text-yellow-400" : "text-gray-300 dark:text-zinc-600"}>
                    ★
                  </span>
                </button>
              ))}
              </div>
              
            </div>

            {/* Botão de Agendar Antigo / Padrão */}
            <button
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all active:scale-98 text-center text-sm cursor-pointer shadow-xs"
              onClick={() => navigate("/agendamento", { state: { servico, empresa: nomeEmpresa } })}
            >
              Agendar Horário
            </button>
          </div>
        </div>

        {/* COLUNA 2: Lista dos 7 Dias na Vertical (Bolas Azuis / Cinzas) */}
        <div className="flex flex-col justify-center border-l border-gray-200 dark:border-zinc-700 pl-6 gap-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Horários Disponíveis:
          </p>
          
          <div className="flex flex-col gap-2">
            {DIAS_SEMANA.map((dia, i) => {
              const d = servico.diasDisponiveis?.[i];
              const isAtivo = !!d?.ativo;

              return (
                <div key={dia} className="flex items-center gap-3">
                  {/* Bola do Dia: Azul se true, Cinza se false */}
                  <div
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-colors shrink-0 text-white shadow-xs
                      ${isAtivo 
                        ? "bg-blue-600 border border-blue-700" 
                        : "bg-gray-400 border border-gray-500 dark:bg-zinc-600 dark:border-zinc-500"
                      }`}
                  >
                    {dia}
                  </div>
                  
                  {/* Horário na frente */}
                  <span
                    className={`text-sm font-semibold transition-colors
                      ${isAtivo 
                        ? "text-gray-800 dark:text-gray-200" 
                        : "text-gray-400 dark:text-zinc-500 font-normal"
                      }`}
                  >
                    {isAtivo ? `${d.inicio} às ${d.fim}` : "Fechado"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ServicoItem;