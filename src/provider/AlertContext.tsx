import { createContext, useContext, useState } from "react"; // Importa o createContext para criar o contexto, useContext para consumir o contexto e useState para gerenciar o estado do alerta
import CardAlerta from "../components/CardAlerta";

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

  // Fornece o contexto do alerta para os componentes filhos, incluindo as funções para mostrar e fechar o alerta, e renderiza o componente ModalAlerta para exibir o alerta globalmente
  return (
    <AlertaContext.Provider value={{ showAlerta, closeAlerta }}>
      {children}

      {/* 🔥 Modal global */}
      <CardAlerta
        aberto={alerta.aberto}
        titulo={alerta.titulo}
        label={alerta.texto}
        type={alerta.tipo}
        onClose={closeAlerta}
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
