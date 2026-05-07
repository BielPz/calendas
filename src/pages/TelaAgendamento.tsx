import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import MiniCalendario from "../components/MiniCalendario";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { X } from "lucide-react";
import type { Agendamento, Servico } from "../firebase/types";
import TextInput from "../components/TextInput";
import { getServicosDaEmpresa } from "../firebase/database";

interface Props {
  cor_fundo: string;
}

function TelaAgendamento({ cor_fundo }: Props) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [servicos, setServicos] = useState<{ label: string; value: string }[]>(
    [],
  );
  const navigate = useNavigate();

  const location = useLocation();
  const { servico, empresa } = location.state as {
    servico: Servico;
    empresa: string;
  };

  const [form, setForm] = useState<Agendamento>({
    servico: "",
    data: "",
    horario: "",
    obs: "",
  });

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  useEffect(() => {
    async function carregar() {
      const data = await getServicosDaEmpresa(servico.idEmpresa!);
      const opcoes = data
        .filter((s) => s.id !== undefined)
        .map((s) => ({
          label: s.nome,
          value: s.id!,
        }));
      setServicos(opcoes);
    }
    carregar();
  }, []);

  const auth = getAuth();
  useEffect(() => {
    setNomeUsuario(auth.currentUser?.displayName || "");
  }, [auth]);

  if (!nomeUsuario) return <p>Carregando...</p>;

  return (
    <div
      className={`${cor_fundo} h-screen w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center overflow-hidden">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              className="px-4 rounded-lg border border-gray-300 focus:outline-none bg-white"
              onClick={() => navigate("/feed")}
            >
              <X size={20} strokeWidth={3} className="text-gray-500" />
            </button>
            <div className="relative flex items-center rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 w-full">
              <h1>{empresa}</h1>
            </div>
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          <div className="md:hidden shrink-0"></div>

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            <div className="hidden md:block bg-white md:w-1/5 p-3 rounded-lg shrink-0">
              <MiniCalendario />
              {/* Adicionar seleção de serviço e horário e botão para agendar */}
              <TextInput
                titulo="Serviço"
                type="select"
                onChange={(value) => handleChange("servico", value)}
                selected={servico?.nome}
                options={servicos}
              />
              <TextInput
                titulo="Data"
                type="date"
                onChange={(value) => handleChange("data", value)}
              />
              <TextInput
                titulo="Horário"
                type="select"
                onChange={(value) => handleChange("horario", value)}
              />
              <TextInput
                titulo="Observação"
                type="text"
                onChange={(value) => handleChange("obs", value)}
              />
              <button onClick={() => console.log(form)}></button>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              <div className="bg-white p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {/* Aqui é o conteúdo do calendário do principal da empresa */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaAgendamento;
