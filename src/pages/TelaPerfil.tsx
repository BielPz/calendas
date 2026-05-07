import { useEffect, useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import { getTipoUsuario } from "../firebase/auth";
import { signOut } from "firebase/auth";
import { atualizarPerfil } from "../firebase/database";
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
} from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import { get, ref } from "firebase/database";

type Secao = "perfil" | "configuracoes" | "privacidade" | "notificacoes" | "pagamentos" | "ajuda";

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
  const [dadosEditados, setDadosEditados] = useState<Record<string, string>>({});
  const { showAlerta } = useAlerta();
  const navigate = useNavigate();

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
      showAlerta("Sucesso", "Perfil e conta atualizados com sucesso!", "sucesso");
    } catch (error) {
      console.error(error);
      showAlerta("Erro", "Erro ao sincronizar dados da conta.", "erro");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); 
    } catch (error) {
      showAlerta("Erro", "Erro ao sair.", "erro");
    }
  };

  const handleCancelar = () => {
    setDadosEditados(dados);
    setEditando(false);
  };

  if (!tipo) return <div className="h-screen bg-orange-400 p-10 text-white font-bold">Carregando...</div>;

  const iniciais = (dados.nome || "U").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-400 to-purple-400 overflow-hidden">
      <Cabecalho none />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1400px] mx-auto gap-4 p-4">
        
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col bg-white rounded-2xl shadow-lg w-72 shrink-0 p-6 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2">
            {itensMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setSecaoAtiva(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left mb-2
                  ${secaoAtiva === item.id ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {secaoAtiva === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full border-t border-gray-100 mt-4 pt-4">
            <LogOut size={18} /> Sair
          </button>
        </aside>

        {/* Área Central */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          
          <main className="flex flex-col gap-4 h-full overflow-hidden">
            {secaoAtiva === "perfil" ? (
              <>
                {/* Header fixo */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 shrink-0">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {iniciais}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-800">{dados.nome || "Usuário"}</h2>
                    <p className="text-gray-500 text-sm">{dados.email}</p>
                    <span className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">
                      {tipo}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!editando ? (
                      <button onClick={() => setEditando(true)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all">
                        <Pencil size={16} /> Editar
                      </button>
                    ) : (
                      <>
                        <button onClick={handleCancelar} className="px-4 py-2 text-gray-500 font-bold hover:underline transition-all">Cancelar</button>
                        <button onClick={handleSalvar} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all">Salvar</button>
                      </>
                    )}
                  </div>
                </div>

                {/* AREA DE SCROLL ISOLADA */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 border-b pb-4">
                    Informações Pessoais
                  </h3>
                  
                  <Formulario>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput titulo="Nome Completo" value={editando ? dadosEditados.nome : dados.nome} onChange={(v) => handleCampo("nome", v)} disabled={!editando} />
                      <TextInput titulo="E-mail (Não editável)" value={dados.email} onChange={() => {}} disabled />
                      <TextInput titulo="Telefone" value={editando ? dadosEditados.telefone : dados.telefone} onChange={(v) => handleCampo("telefone", v)} disabled={!editando} />
                      <TextInput titulo="Data de Nascimento" type="date" value={editando ? dadosEditados.dtnasc : dados.dtnasc} onChange={(v) => handleCampo("dtnasc", v)} disabled={!editando} />
                    </div>

                    {tipo === "cliente" && (
                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Localização</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <TextInput titulo="CEP" value={editando ? dadosEditados.cep : dados.cep} onChange={(v) => handleCampo("cep", v)} disabled={!editando} />
                          <TextInput titulo="Logradouro" value={editando ? dadosEditados.logradouro : dados.logradouro} onChange={(v) => handleCampo("logradouro", v)} disabled={!editando} />
                          <TextInput titulo="Bairro" value={editando ? dadosEditados.bairro : dados.bairro} onChange={(v) => handleCampo("bairro", v)} disabled={!editando} />
                          <div className="grid grid-cols-2 gap-4">
                             <TextInput titulo="Cidade" value={editando ? dadosEditados.cidade : dados.cidade} onChange={(v) => handleCampo("cidade", v)} disabled={!editando} />
                             <TextInput titulo="UF" value={editando ? dadosEditados.estado : dados.estado} onChange={(v) => handleCampo("estado", v)} disabled={!editando} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Formulario>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-20 flex-1 flex flex-col items-center justify-center text-gray-400">
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