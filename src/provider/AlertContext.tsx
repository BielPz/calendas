import { createContext, useContext, useState } from "react"; // Importa o createContext para criar o contexto, useContext para consumir o contexto e useState para gerenciar o estado do alerta
import CardAlerta from "../components/CardAlerta";
import ModalConfirmacao from "@/components/ModalConfirmacao";

type Tipo = "sucesso" | "erro" | "aviso" | "desconect" | "info"; // Define os tipos de alerta disponíveis

// Define a interface para o estado do alerta, que inclui se o alerta está aberto, o título, o texto e o tipo do alerta
interface AlertaState {
  aberto: boolean;
  titulo: string;
  texto: string;
  tipo: Tipo;
}

// Define a interface para o contexto do alerta, que inclui as funções para mostrar e fechar o alerta
interface AlertaContextType {
  showAlerta: (titulo: string, texto: string, tipo?: Tipo) => void;
  closeAlerta: () => void;
  confirmar: (
    titulo: string,
    texto: string,
    confirmarLabel?: string,
  ) => Promise<boolean>;
}

// Cria o contexto do alerta com um valor inicial de null, indicando que o contexto ainda não foi fornecido
const AlertaContext = createContext<AlertaContextType | null>(null);

// Hook personalizado para consumir o contexto do alerta, lançando um erro se o contexto não for fornecido
export function AlertaProvider({ children }: { children: React.ReactNode }) {
  const [alerta, setAlerta] = useState<AlertaState>({
    aberto: false,
    titulo: "",
    texto: "",
    tipo: "sucesso",
  });
  const [confirmacao, setConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    texto: string;
    label: string;
    resolver: (resposta: boolean) => void;
  }>({
    aberto: false,
    titulo: "",
    texto: "",
    label: "Confirmar",
    resolver: () => {},
  });

  // Função para mostrar o alerta, atualizando o estado do alerta com os valores fornecidos
  const showAlerta = (
    titulo: string,
    texto: string,
    tipo: Tipo = "sucesso",
  ) => {
    setAlerta({
      aberto: true,
      titulo,
      texto,
      tipo,
    });
  };

  // Função para fechar o alerta, atualizando o estado do alerta para fechado
  const closeAlerta = () => {
    setAlerta((prev) => ({ ...prev, aberto: false }));
  };
  const confirmar = (
    titulo: string,
    texto: string,
    confirmarLabel = "Confirmar",
  ) =>
    new Promise<boolean>((resolver) =>
      setConfirmacao({
        aberto: true,
        titulo,
        texto,
        label: confirmarLabel,
        resolver,
      }),
    );
  const responderConfirmacao = (resposta: boolean) => {
    confirmacao.resolver(resposta);
    setConfirmacao({
      aberto: false,
      titulo: "",
      texto: "",
      label: "Confirmar",
      resolver: () => {},
    });
  };

  // Fornece o contexto do alerta para os componentes filhos, incluindo as funções para mostrar e fechar o alerta, e renderiza o componente ModalAlerta para exibir o alerta globalmente
  return (
    <AlertaContext.Provider value={{ showAlerta, closeAlerta, confirmar }}>
      {children}

      {/* 🔥 Modal global */}
      <CardAlerta
        aberto={alerta.aberto}
        titulo={alerta.titulo}
        label={alerta.texto}
        type={alerta.tipo}
        onClose={closeAlerta}
      />
      <ModalConfirmacao
        aberto={confirmacao.aberto}
        titulo={confirmacao.titulo}
        mensagem={confirmacao.texto}
        confirmarLabel={confirmacao.label}
        onCancelar={() => responderConfirmacao(false)}
        onConfirmar={() => responderConfirmacao(true)}
      />
    </AlertaContext.Provider>
  );
}

// Hook personalizado para consumir o contexto do alerta, lançando um erro se o contexto não for fornecido
export function useAlerta() {
  const context = useContext(AlertaContext); // Consome o contexto do alerta usando o hook useContext, que retorna o valor do contexto ou null se o contexto não for fornecido
  if (!context) {
    throw new Error("useAlerta deve ser usado dentro do AlertaProvider"); // Garante que o hook seja usado dentro do provedor de alerta, caso contrário lança um erro para evitar uso incorreto
  }
  return context; // Retorna o contexto do alerta, permitindo que os componentes consumidores acessem as funções para mostrar e fechar o alerta
}
