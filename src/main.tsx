//import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./main.css";
import TelaInicial from "./pages/TelaInicial";
import TelaLogin from "./pages/TelaLogin";
import TelaCadastro from "./pages/TelaCadastro";
import TelaFeed from "./pages/TelaFeed";
import TelaEsqueciSenha from "./pages/TelaEsqueciSenha";
import TelaCriarServico from "./pages/TelaCriarServico";
import TelaResetSenha from "./pages/TelaResetSenha";
import TelaPerfil from "./pages/TelaPerfil";
import { AlertaProvider } from "./provider/AlertContext";
import TelaCalendario from "./pages/TelaCalendario";
import TelaAgendamento from "./pages/TelaAgendamento";

const gradiente: string = "bg-gradient-to-br from-orange-400 to-purple-400";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AlertaProvider>
      <Routes>
        <Route path="/" element={<TelaInicial cor_fundo={gradiente} />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/cadastro" element={<TelaCadastro />} />
        <Route path="/feed" element={<TelaFeed cor_fundo={gradiente} />} />
        <Route
          path="/esqueci-senha"
          element={<TelaEsqueciSenha cor_fundo={gradiente} />}
        />
        <Route
          path="/reset-senha"
          element={<TelaResetSenha cor_fundo={gradiente} />}
        />
        <Route path="/cadastro-servico" element={<TelaCriarServico />} />
        <Route path="/perfil" element={<TelaPerfil />} />
        <Route
          path="/calendario"
          element={<TelaCalendario cor_fundo={gradiente} />}
        />
        <Route
          path="/agendamento"
          element={<TelaAgendamento cor_fundo={gradiente} />}
        />
      </Routes>
    </AlertaProvider>
  </BrowserRouter>,
);
