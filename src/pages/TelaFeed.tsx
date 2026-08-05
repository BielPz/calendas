import { useEffect, useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getTipoUsuario } from "../features/auth/auth.service";
import { getTodosServicos } from "../features/servicos/servico.service";
import { getEmpresasDoPrestador } from "../features/empresas/empresa.service";
import { getFavoritos, toggleFavorito } from "../features/perfil/perfil.service";
import { getAgendamentosUsuario } from "../features/agendamentos/agendamento.service";
import DisplayServicos from "../components/prestador/DisplayServicos";
import ServicoItem from "../components/cliente/ServicoItem";
import type { Agendamento, Servico } from "../firebase/types";
import { getAuth } from "firebase/auth";
import SideBarCliente from "../components/cliente/SideBarCliente";
import SideBarPrestador from "../components/prestador/SideBarPrestador";
import { useAlerta } from "../provider/AlertContext";
import { Check, ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import NotificacaoAgendamento from "../components/prestador/NotificacaoAgendamento";
import { db } from "../firebase/config";
import { get, onValue, ref } from "firebase/database";

function TelaFeed() {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [idsFavoritos, setIdsFavoritos] = useState<Set<string>>(new Set());
  const [agendamento, setAgendamentos] = useState<Agendamento[]>([]);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [somenteFavoritosSelecionado, setSomenteFavoritosSelecionado] = useState(false);
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  const [ordenacaoSelecionada, setOrdenacaoSelecionada] = useState<"relevancia" | "avaliacao" | "menor-preco" | "maior-preco">("relevancia");
  const [ordenacao, setOrdenacao] = useState<"relevancia" | "avaliacao" | "menor-preco" | "maior-preco">("relevancia");
  const [limiteServicos, setLimiteServicos] = useState(20);

  const auth = getAuth();
  const id = auth.currentUser?.uid;

  const { showAlerta } = useAlerta();
  const navigate = useNavigate();
  const cor_fundo = useGradiente();

  useEffect(() => {
    getTipoUsuario()
      .then((tipo) => {
        setUsuario(tipo);
        setNomeUsuario(auth.currentUser?.displayName || "");
        if (tipo === "cliente") {
          getFavoritos()
            .then((ids) => setIdsFavoritos(new Set(ids)))
            .catch(console.error);
          getTodosServicos()
            .then(setServicos)
            .catch((err) => {
              console.error(err);
              showAlerta(
                "Erro",
                "Erro ao carregar serviços. Por favor, tente novamente.",
                "erro",
              );
            });
        } else {
          getEmpresasDoPrestador()
            .then((lista) => {
              setEmpresas(lista);
              if (lista.length > 0) setIdEmpresaAtiva(lista[0].id);
            })
            .catch((err) => {
              console.error(err);
              showAlerta(
                "Erro",
                "Erro ao carregar empresas do prestador. Por favor, tente novamente.",
                "erro",
              );
            });
        }
      })
      .catch((err) => {
        console.error(err);
        showAlerta(
          "Erro",
          "Erro ao carregar tipo de usuário. Por favor, faça login novamente.",
          "erro",
        );
      });
  }, [showAlerta]);

  useEffect(() => {
    if (!id) return;
    const carregarDados = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const colecao = usuario === "cliente" ? "clientes" : "prestadores";
        const snap = await get(ref(db, `${colecao}/${uid}/imagem`));
        setFotoPerfil(snap.val());
      } catch (err) {
        console.error(err);
        showAlerta("Erro", "Erro ao carregar foto de perfil.", "erro");
      }
    };
    carregarDados();
  }, [id, usuario, auth, showAlerta]);

  useEffect(() => {
    const handleCtrlS = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s" && usuario === "prestador") {
        e.preventDefault(); // evita o "Salvar" padrão do browser
        navigate("/cadastro-servico");
      }
    };

    window.addEventListener("keydown", handleCtrlS);

    return () => window.removeEventListener("keydown", handleCtrlS); // cleanup
  }, [navigate, usuario]);

  const handleFavoritoChange = (idServico: string, favoritado: boolean) => {
    setIdsFavoritos((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      favoritado ? next.add(idServico) : next.delete(idServico);
      return next;
    });
  };

  // Serviços que estão nos favoritos (para passar à sidebar)
  const servicosFavoritos = servicos.filter(
    (s) => s.id && idsFavoritos.has(s.id),
  );
  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const filtrados = servicos.filter((servico) => {
      const corresponde = !termo || [servico.nome, servico.descricao, servico.configuracaoAtendimento?.modalidade]
        .filter(Boolean)
        .some((valor) => String(valor).toLocaleLowerCase("pt-BR").includes(termo));
      return corresponde && (!somenteFavoritos || (!!servico.id && idsFavoritos.has(servico.id)));
    });
    return [...filtrados].sort((a, b) => {
      if (ordenacao === "avaliacao") return (b.avaliacaoMedia ?? 0) - (a.avaliacaoMedia ?? 0);
      if (ordenacao === "menor-preco") return Number(a.preco) - Number(b.preco);
      if (ordenacao === "maior-preco") return Number(b.preco) - Number(a.preco);
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [busca, idsFavoritos, ordenacao, somenteFavoritos, servicos]);

  const aplicarPesquisa = () => {
    setBusca(buscaDigitada);
    setSomenteFavoritos(somenteFavoritosSelecionado);
    setOrdenacao(ordenacaoSelecionada);
    setLimiteServicos(20);
  };

  useEffect(() => setLimiteServicos(20), [busca, somenteFavoritos, ordenacao]);

  const removerFavorito = async (idServico: string) => {
    try {
      const favoritado = await toggleFavorito(idServico);
      handleFavoritoChange(idServico, favoritado);
    } catch {
      showAlerta("Erro", "Não foi possível remover o favorito.", "erro");
    }
  };

  const atualizarAvaliacao = (idServico: string, nota: number, comentario: string) => {
    if (!id) return;
    setServicos((lista) => lista.map((servico) => {
      if (servico.id !== idServico) return servico;
      const avaliacoes = {
        ...servico.avaliacoes,
        [id]: { nota, comentario, atualizadoEm: Date.now() },
      };
      const notas = Object.values(avaliacoes).map((avaliacao) => avaliacao.nota);
      return {
        ...servico,
        avaliacoes,
        totalAvaliacoes: notas.length,
        avaliacaoMedia: notas.reduce((total, valor) => total + valor, 0) / notas.length,
      };
    }));
  };

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      const lista = await getAgendamentosUsuario(id!);
      setAgendamentos(lista);
    };
    carregar();
  }, [id]);

  useEffect(() => {
    if (!id || usuario !== "prestador") return;
    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const inscricoes: (() => void)[] = [];
    const atualizarAgendamentos = () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(() => getAgendamentosUsuario(id).then((itens) => { if (ativo) setAgendamentos(itens); }).catch(console.error), 150);
    };
    getEmpresasDoPrestador().then(async (lista) => {
      const idsPorEmpresa = await Promise.all(lista.map(async (empresa) => {
        const snapshot = await get(ref(db, `empresas/${empresa.id}/servicos`));
        return snapshot.exists() ? Object.keys(snapshot.val() as Record<string, true>) : [];
      }));
      if (!ativo) return;
      idsPorEmpresa.flat().forEach((idServico) => inscricoes.push(onValue(ref(db, `servicos/${idServico}/agendamentos`), atualizarAgendamentos)));
    }).catch(console.error);
    return () => { ativo = false; if (temporizador) clearTimeout(temporizador); inscricoes.forEach((cancelar) => cancelar()); };
  }, [id, usuario]);

  if (!usuario) return <Loading />;

  return (
    <div
      className={`${cor_fundo} flex h-dvh w-full flex-col overflow-hidden`}
    >
      <Cabecalho
        perfil
        nome={nomeUsuario}
        fotoPerfil={fotoPerfil ? fotoPerfil : undefined}
      />
      <div className="flex min-h-0 grow w-full flex-col items-center overflow-hidden">
        <div className="flex min-h-0 w-full max-w-7xl grow flex-col gap-4 overflow-hidden p-4">
          {usuario === "cliente" && <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <form
              className="feed-search flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                aplicarPesquisa();
              }}
            >
              <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-300" />
              <input
                type="search"
                placeholder="Pesquisar serviços"
                value={buscaDigitada}
                onChange={(event) => {
                  const valor = event.target.value;
                  setBuscaDigitada(valor);
                  if (!valor.trim()) setBusca("");
                }}
                className="feed-search-input"
              />
              <button type="submit" className="feed-search-button">
                Pesquisar
              </button>
            </form>
            {usuario === "cliente" && (
              <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSomenteFavoritosSelecionado((valor) => !valor)}
                className={somenteFavoritosSelecionado ? "ui-button-primary flex h-13 shrink-0 items-center gap-1.5 text-sm" : "ui-button-secondary flex h-13 shrink-0 items-center gap-1.5 text-sm"}
                aria-pressed={somenteFavoritosSelecionado}
              >
                {somenteFavoritosSelecionado && <Check size={17} strokeWidth={3} />}
                Favoritos
              </button>
              <div className="feed-filter">
              <select value={ordenacaoSelecionada} onChange={(event) => setOrdenacaoSelecionada(event.target.value as typeof ordenacaoSelecionada)} className="feed-filter-select">
                <option value="relevancia">A–Z</option>
                <option value="avaliacao">Melhores avaliados</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-300" />
              </div>
              </div>
            )}
          </div>}
          {usuario === "prestador" && <div className="ui-card flex shrink-0 flex-wrap items-center justify-between gap-3 p-3">
            <div><h1 className="font-bold text-slate-800 dark:text-zinc-100">Gerenciar empresa</h1></div>
            <div className="flex w-full gap-2 sm:w-auto"><div className="feed-filter flex-1 sm:w-64"><select value={idEmpresaAtiva} onChange={(e) => setIdEmpresaAtiva(e.target.value)} className="feed-filter-select"><option value="">Selecione a empresa...</option>{empresas.map((empresa) => <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>)}</select><ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-300" /></div><button onClick={() => navigate("/cadastro-empresa")} className="ui-button-primary shrink-0 text-sm">+ Empresa</button></div>
          </div>}

          {/* Barra horizontal de ícones — só mobile */}
          {usuario === "cliente" && (
            <div className="md:hidden shrink-0">
              <SideBarCliente favoritos={servicosFavoritos} onRemoverFavorito={removerFavorito} onNavigateServico={(servico) => navigate(`/servicos/${servico.id}`)} />
            </div>
          )}
          {usuario === "prestador" && (
            <div className="md:hidden shrink-0">
              <SideBarPrestador />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            {usuario === "cliente" && (
              <div className="ui-card hidden shrink-0 overflow-y-auto p-3 md:block md:w-1/5">
                <SideBarCliente favoritos={servicosFavoritos} onRemoverFavorito={removerFavorito} onNavigateServico={(servico) => navigate(`/servicos/${servico.id}`)} />
              </div>
            )}
            {usuario === "prestador" && (
              <div className="ui-card hidden shrink-0 overflow-y-auto p-3 md:block md:w-1/5">
                <SideBarPrestador />
              </div>
            )}

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              {usuario === "prestador" && (
                <div className="ui-card p-3 overflow-x-auto shrink-0">
                  <DisplayServicos idEmpresa={idEmpresaAtiva} />
                </div>
              )}
              <div className="ui-card p-3 overflow-y-auto flex-1 min-h-0">
                {usuario === "cliente" && (
                  <div className="flex flex-col gap-3">
                    {servicosFiltrados.slice(0, limiteServicos).map((servico) => (
                      <ServicoItem
                        key={servico.id}
                        servico={servico}
                        favoritoInicial={
                          !!servico.id && idsFavoritos.has(servico.id)
                        }
                        onFavoritoChange={handleFavoritoChange}
                        onAvaliacaoChange={atualizarAvaliacao}
                      />
                    ))}
                    {servicosFiltrados.length > limiteServicos && <button type="button" className="ui-button-secondary self-center px-5 py-2 text-sm" onClick={() => setLimiteServicos((limite) => limite + 20)}>Carregar mais serviços</button>}
                    {servicosFiltrados.length === 0 && <p className="ui-card-muted p-5 text-center text-sm text-slate-600 dark:text-zinc-300">Nenhum serviço encontrado com esses filtros.</p>}
                  </div>
                )}
                {usuario === "prestador" && idEmpresaAtiva && (
                  <div className="flex flex-col gap-3">
                    {agendamento.map((ag) => (
                      <NotificacaoAgendamento key={ag.id} agendamento={ag} onRespondida={(idAgendamento) => setAgendamentos((itens) => itens.filter((item) => item.id !== idAgendamento))} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaFeed;
