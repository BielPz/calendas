import { useEffect, useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import { getTipoUsuario } from "../features/auth/auth.service";
import { signOut } from "firebase/auth";
import { atualizarPerfil, excluirConta } from "../features/perfil/perfil.service";
import { auth, db } from "../firebase/config";
import { useAlerta } from "../provider/AlertContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  CreditCard,
  ChevronRight,
  Pencil,
  Trash2,
  Camera,
} from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import { get, ref } from "firebase/database";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import { uploadImage } from "../cloudinary/upload";

type Secao =
  | "perfil"
  | "configuracoes"
  | "privacidade"
  | "notificacoes"
  | "pagamentos"
  | "ajuda";

const itensMenu: { id: Secao; label: string; icon: React.ReactNode }[] = [
  { id: "perfil", label: "Perfil", icon: <User size={18} /> },
  { id: "configuracoes", label: "Configurações", icon: <Settings size={18} /> },
  { id: "privacidade", label: "Privacidade", icon: <Shield size={18} /> },
  { id: "notificacoes", label: "Notificações", icon: <Bell size={18} /> },
  { id: "pagamentos", label: "Pagamentos", icon: <CreditCard size={18} /> },
  { id: "ajuda", label: "Ajuda", icon: <HelpCircle size={18} /> },
];

function TelaPerfil() {
  const [tipo, setTipo] = useState<"cliente" | "prestador" | null>(null);
  const [dados, setDados] = useState<Record<string, string>>({});
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>("perfil");
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState<Record<string, string>>(
    {},
  );
  const { showAlerta } = useAlerta();
  const navigate = useNavigate();
  const cor_fundo = useGradiente();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const t = await getTipoUsuario();
        setTipo(t);
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const colecao = t === "cliente" ? "clientes" : "prestadores";
        const snap = await get(ref(db, `${colecao}/${uid}`));

        if (snap.exists()) {
          setDados(snap.val());
          setDadosEditados(snap.val());
        }
      } catch (err) {
        console.error(err);
        showAlerta("Erro", "Erro ao carregar dados.", "erro");
      }
    };
    carregarDados();
  }, []);

  const imagemPerfil = dadosEditados.imagem || dados.imagem || "";

  const handleImagemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      await atualizarPerfil(tipo!, { ...dadosEditados, imagem: url });
      setDados((prev) => ({ ...prev, imagem: url }));
      setDadosEditados((prev) => ({ ...prev, imagem: url }));
      showAlerta("Sucesso", "Imagem de perfil atualizada!", "sucesso");
    } catch (error) {
      console.error(error);
      showAlerta("Erro", "Erro ao fazer upload da imagem.", "erro");
    }
  };

  const handleCampo = (campo: string, valor: string) => {
    setDadosEditados((prev) => ({ ...prev, [campo]: valor }));
  };

  // LOGICA DE SALVAR: Agora atualiza Database e Auth Profile
  const handleSalvar = async () => {
    if (!tipo) return;

    try {
      // Esta função agora chama o updateProfile internamente no database.ts
      await atualizarPerfil(tipo, dadosEditados);

      setDados((prev) => ({ ...prev, ...dadosEditados }));
      setEditando(false);
      showAlerta(
        "Sucesso",
        "Perfil e conta atualizados com sucesso!",
        "sucesso",
      );
    } catch (error) {
      console.error(error);
      showAlerta("Erro", "Erro ao sincronizar dados da conta.", "erro");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      showAlerta("Erro", "Erro ao sair.", "erro");
    }
  };

  const handleCancelar = () => {
    setDadosEditados(dados);
    setEditando(false);
  };

  const handleExcluirConta = async () => {
    if (!tipo) return;
    const confirmado = window.confirm(
      "Tem certeza? Sua conta será excluída permanentemente. Esta ação não pode ser desfeita.",
    );
    if (!confirmado) return;

    try {
      await excluirConta(tipo);
      showAlerta("Sucesso", "Conta excluída com sucesso.", "sucesso");
      navigate("/login");
    } catch {
      showAlerta("Erro", "Erro ao solicitar exclusão da conta.", "erro");
    }
  };

  if (!tipo) return <Loading />;

  const iniciais = (dados.nome || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`flex h-dvh flex-col overflow-hidden ${cor_fundo}`}>
      <Cabecalho none />

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
        <nav className="ui-card flex gap-1 overflow-x-auto p-2 md:hidden" aria-label="Seções do perfil">
          {itensMenu.map((item) => (
            <button key={item.id} onClick={() => setSecaoAtiva(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${secaoAtiva === item.id ? "bg-linear-to-r from-orange-500 to-violet-600 text-white" : "text-slate-600 dark:text-zinc-300"}`}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        {/* Sidebar Desktop */}
        <aside className="ui-card hidden w-72 shrink-0 flex-col p-4 md:flex">
          <div className="flex-1 overflow-y-auto pr-2">
            {itensMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setSecaoAtiva(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all mb-1
                  ${secaoAtiva === item.id ? "bg-linear-to-r from-orange-500 to-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-orange-50 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {secaoAtiva === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 pt-4 pb-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-red-400"
          >
            <LogOut size={18} /> Sair
          </button>
        </aside>

        {/* Área Central */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {secaoAtiva === "perfil" ? (
              <>
                {/* Header fixo */}
                <div className="ui-card flex flex-col items-center gap-5 p-5 sm:flex-row sm:p-6">
                  <label className="relative w-20 h-20 rounded-full cursor-pointer group shrink-0">
                    {imagemPerfil ? (
                      <img
                        src={imagemPerfil}
                        alt="Foto de perfil"
                        className="w-20 h-20 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-violet-600 text-2xl font-bold text-white shadow-sm">
                        {iniciais}
                      </div>
                    )}
                    {/* Overlay ao hover */}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagemChange}
                    />
                  </label>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {dados.nome || "Usuário"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      {dados.email}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase text-orange-700 dark:bg-orange-400/10 dark:text-orange-200">
                      {tipo}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!editando ? (
                      <button
                        onClick={() => setEditando(true)}
                        className="ui-button-secondary flex items-center gap-2"
                      >
                        <Pencil size={16} /> Editar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancelar}
                          className="px-4 py-2 font-bold text-slate-600 hover:underline dark:text-zinc-300"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSalvar}
                          className="ui-button-primary px-6"
                        >
                          Salvar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AREA DE SCROLL ISOLADA */}
                <div className="ui-card p-5 sm:p-8">
                  <h3 className="mb-8 border-b border-slate-200 pb-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:border-zinc-700 dark:text-zinc-300">
                    Informações Pessoais
                  </h3>

                  <Formulario>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput
                        titulo="Nome Completo"
                        value={editando ? dadosEditados.nome : dados.nome}
                        onChange={(v) => handleCampo("nome", v)}
                        disabled={!editando}
                        maxLength={50}
                      />
                      <TextInput
                        titulo="E-mail (Não editável)"
                        value={dados.email}
                        onChange={() => {}}
                        disabled
                      />
                      <TextInput
                        titulo="Telefone"
                        value={
                          editando ? dadosEditados.telefone : dados.telefone
                        }
                        onChange={(v) => handleCampo("telefone", v)}
                        disabled={!editando}
                      />
                      <TextInput
                        titulo="Data de Nascimento"
                        type="date"
                        value={editando ? dadosEditados.dtnasc : dados.dtnasc}
                        onChange={(v) => handleCampo("dtnasc", v)}
                        disabled={!editando}
                      />
                    </div>

                    {tipo === "cliente" && (
                      <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-500">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-200 uppercase tracking-widest mb-6">
                          Localização
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <TextInput
                            titulo="CEP"
                            value={editando ? dadosEditados.cep : dados.cep}
                            onChange={(v) => handleCampo("cep", v)}
                            disabled={!editando}
                          />
                          <TextInput
                            titulo="Logradouro"
                            value={
                              editando
                                ? dadosEditados.logradouro
                                : dados.logradouro
                            }
                            onChange={(v) => handleCampo("logradouro", v)}
                            disabled={!editando}
                            maxLength={50}
                          />
                          <TextInput
                            titulo="Bairro"
                            value={
                              editando ? dadosEditados.bairro : dados.bairro
                            }
                            onChange={(v) => handleCampo("bairro", v)}
                            disabled={!editando}
                            maxLength={50}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <TextInput
                              titulo="Cidade"
                              value={
                                editando ? dadosEditados.cidade : dados.cidade
                              }
                              onChange={(v) => handleCampo("cidade", v)}
                              disabled={!editando}
                            />
                            <TextInput
                              titulo="UF"
                              value={
                                editando ? dadosEditados.estado : dados.estado
                              }
                              onChange={(v) => handleCampo("estado", v)}
                              disabled={!editando}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Formulario>
                  <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-500">
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-200 uppercase tracking-widest mb-4">
                      Zona de perigo
                    </h3>
                    <div className="flex items-center justify-between bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                          Excluir conta
                        </p>
                        <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">
                          Sua conta será excluída permanentemente.
                        </p>
                      </div>
                      <button
                        onClick={handleExcluirConta}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 size={15} /> Excluir conta
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="ui-card flex min-h-72 flex-1 flex-col items-center justify-center p-8 text-slate-500 dark:text-zinc-300">
                <p className="font-bold">Seção {secaoAtiva} em breve.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default TelaPerfil;
