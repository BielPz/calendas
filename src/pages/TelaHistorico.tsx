import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import SideBarCliente from "../components/cliente/SideBarCliente";
import SideBarPrestador from "../components/prestador/SideBarPrestador";
import { useAlerta } from "../provider/AlertContext";
import { ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useGradiente } from "../hooks/useGradiente";
import { db } from "../firebase/config";
import { get, onValue, ref } from "firebase/database";
import { getTipoUsuario } from "@/features/auth/auth.service";
import {
  getAgendamentosUsuario,
  getEmpresasDoPrestador,
  getFavoritos,
  getTodosServicos,
  toggleFavorito,
} from "@/data/realtime.repository";
import Cabecalho from "@/components/utils/Cabecalho";
import Loading from "@/components/utils/Loading";
import type { Agendamento, Servico } from "@/firebase/types";
import CardHistorico from "@/components/modals/CardHistorico";
import { ROTULO_STATUS } from "@/components/utils/statusAgendamento";

type OrdenacaoHistorico = "recente" | "antigo" | "concluido" | "cancelado";

function TelaHistorico() {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [idsFavoritos, setIdsFavoritos] = useState<Set<string>>(new Set());
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState("");
  const [ordenacaoSelecionada, setOrdenacaoSelecionada] =
    useState<OrdenacaoHistorico>("recente");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoHistorico>("recente");
  const [limiteHistorico, setLimiteHistorico] = useState(20);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

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

  const aplicarPesquisa = () => {
    setBusca(buscaDigitada);
    setOrdenacao(ordenacaoSelecionada);
    setLimiteHistorico(20);
  };

  useEffect(() => setLimiteHistorico(20), [busca, ordenacao]);

  // ------------------------- SideBar Favoritos -------------------------------------
  const handleFavoritoChange = (idServico: string, favoritado: boolean) => {
    setIdsFavoritos((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      favoritado ? next.add(idServico) : next.delete(idServico);
      return next;
    });
  };

  const removerFavorito = async (idServico: string) => {
    try {
      const favoritado = await toggleFavorito(idServico);
      handleFavoritoChange(idServico, favoritado);
    } catch {
      showAlerta("Erro", "Não foi possível remover o favorito.", "erro");
    }
  };

  // Serviços que estão nos favoritos (para passar à sidebar)
  const servicosFavoritos = servicos.filter(
    (s) => s.id && idsFavoritos.has(s.id),
  );
  // ----------------------------------------------------------------------------------

  useEffect(() => {
    if (!id || usuario !== "cliente") return;
    getAgendamentosUsuario(id)
      .then(setAgendamentos)
      .catch((err) => {
        console.error(err);
        showAlerta("Erro", "Erro ao carregar agendamentos.", "erro");
      });
  }, [id, usuario, showAlerta]);

  useEffect(() => {
    if (!id || usuario !== "prestador") return;
    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const inscricoes: (() => void)[] = [];
    const atualizarAgendamentos = () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(
        () =>
          getAgendamentosUsuario(id)
            .then((itens) => {
              if (ativo) setAgendamentos(itens);
            })
            .catch(console.error),
        150,
      );
    };
    getEmpresasDoPrestador()
      .then(async (lista) => {
        const idsPorEmpresa = await Promise.all(
          lista.map(async (empresa) => {
            const snapshot = await get(
              ref(db, `empresas/${empresa.id}/servicos`),
            );
            return snapshot.exists()
              ? Object.keys(snapshot.val() as Record<string, true>)
              : [];
          }),
        );
        if (!ativo) return;
        idsPorEmpresa
          .flat()
          .forEach((idServico) =>
            inscricoes.push(
              onValue(
                ref(db, `servicos/${idServico}/agendamentos`),
                atualizarAgendamentos,
              ),
            ),
          );
      })
      .catch(console.error);
    return () => {
      ativo = false;
      if (temporizador) clearTimeout(temporizador);
      inscricoes.forEach((cancelar) => cancelar());
    };
  }, [id, usuario]);

  const agendamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    let lista = agendamentos.filter(
      (a) =>
        usuario !== "prestador" ||
        !idEmpresaAtiva ||
        a.idEmpresa === idEmpresaAtiva,
    );

    lista = lista.filter(
      (a) =>
        !termo ||
        [
          a.servico?.nome,
          a.clienteNome,
          a.data,
          a.horario,
          a.status && ROTULO_STATUS[a.status],
        ]
          .filter(Boolean)
          .some((v) => String(v).toLocaleLowerCase("pt-BR").includes(termo)),
    );

    if (ordenacao === "concluido")
      lista = lista.filter((a) => a.status === "concluido");
    if (ordenacao === "cancelado")
      lista = lista.filter((a) => a.status === "cancelado");

    return [...lista].sort((a, b) => {
      const chaveA = `${a.data} ${a.horario}`;
      const chaveB = `${b.data} ${b.horario}`;
      return ordenacao === "antigo"
        ? chaveA.localeCompare(chaveB)
        : chaveB.localeCompare(chaveA);
    });
  }, [agendamentos, busca, ordenacao, usuario, idEmpresaAtiva]);

  if (!usuario) return <Loading />;

  return (
    <div className={`${cor_fundo} flex h-dvh w-full flex-col overflow-hidden`}>
      <Cabecalho
        perfil
        nome={nomeUsuario}
        fotoPerfil={fotoPerfil ? fotoPerfil : undefined}
      />
      <div className="flex min-h-0 grow w-full flex-col items-center overflow-hidden">
        {/* Celular: rola tudo | md+: só a lista rola */}
        <div className="flex min-h-0 w-full max-w-7xl grow flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4 md:overflow-hidden">
          {usuario === "cliente" && (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <form
                className="feed-search flex-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  aplicarPesquisa();
                }}
              >
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-300"
                />
                <input
                  type="search"
                  placeholder="Pesquisar Agendamentos"
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
              <div className="feed-filter w-full sm:w-52">
                <select
                  value={ordenacaoSelecionada}
                  onChange={(event) =>
                    setOrdenacaoSelecionada(
                      event.target.value as typeof ordenacaoSelecionada,
                    )
                  }
                  className="feed-filter-select"
                >
                  <option value="recente">Mais Recente</option>
                  <option value="antigo">Mais Antigo</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-300"
                />
              </div>
            </div>
          )}

          {usuario === "prestador" && (
            <div className="ui-card flex shrink-0 flex-wrap items-center justify-between gap-3 p-3">
              <h1 className="font-bold text-slate-800 dark:text-zinc-100">
                Gerenciar empresa
              </h1>
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="feed-filter w-full sm:w-64">
                  <select
                    value={idEmpresaAtiva}
                    onChange={(e) => setIdEmpresaAtiva(e.target.value)}
                    className="feed-filter-select"
                  >
                    <option value="">Selecione a empresa...</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Barra horizontal de ícones — só mobile */}
          {usuario === "cliente" && (
            <div className="shrink-0 md:hidden">
              <SideBarCliente
                favoritos={servicosFavoritos}
                onRemoverFavorito={removerFavorito}
                onNavigateServico={(servico) =>
                  navigate(`/servicos/${servico.id}`)
                }
              />
            </div>
          )}
          {usuario === "prestador" && (
            <div className="shrink-0 md:hidden">
              <SideBarPrestador />
            </div>
          )}

          <div className="flex shrink-0 flex-col gap-3 md:min-h-0 md:shrink md:grow md:flex-row">
            {/* Sidebar vertical — só desktop */}
            {usuario === "cliente" && (
              <div className="ui-card hidden shrink-0 overflow-y-auto p-3 md:block md:w-56 lg:w-64">
                <SideBarCliente
                  favoritos={servicosFavoritos}
                  onRemoverFavorito={removerFavorito}
                  onNavigateServico={(servico) =>
                    navigate(`/servicos/${servico.id}`)
                  }
                />
              </div>
            )}
            {usuario === "prestador" && (
              <div className="ui-card hidden shrink-0 overflow-y-auto p-3 md:block md:w-56 lg:w-64">
                <SideBarPrestador />
              </div>
            )}

            <div className="flex w-full min-w-0 flex-col gap-3 md:min-h-0 md:flex-1">
              <div className="ui-card flex flex-col gap-3 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
                {agendamentosFiltrados.slice(0, limiteHistorico).map((a) => (
                  <CardHistorico key={a.id} agendamento={a} usuario={usuario} />
                ))}

                {agendamentosFiltrados.length > limiteHistorico && (
                  <button
                    type="button"
                    className="ui-button-secondary self-center px-5 py-2 text-sm"
                    onClick={() => setLimiteHistorico((l) => l + 20)}
                  >
                    Carregar mais
                  </button>
                )}

                {agendamentosFiltrados.length === 0 && (
                  <p className="ui-card-muted p-5 text-center text-sm text-slate-600 dark:text-zinc-300">
                    Nenhum agendamento encontrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaHistorico;
