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
import { ThemeProvider } from "./provider/ThemeContext";
import TelaCriarEmpresa from "./pages/TelaCriarEmpresa";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AlertaProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<TelaInicial />} />
          <Route path="/login" element={<TelaLogin />} />
          <Route path="/cadastro" element={<TelaCadastro />} />
          <Route path="/feed" element={<TelaFeed />} />
          <Route path="/esqueci-senha" element={<TelaEsqueciSenha />} />
          <Route path="/reset-senha" element={<TelaResetSenha />} />
          <Route path="/cadastro-servico" element={<TelaCriarServico />} />
          <Route path="/perfil" element={<TelaPerfil />} />
          <Route path="/calendario" element={<TelaCalendario />} />
          <Route path="/agendamento" element={<TelaAgendamento />} />
          <Route path="/cadastro-empresa" element={<TelaCriarEmpresa />} />
        </Routes>
      </ThemeProvider>
    </AlertaProvider>
  </BrowserRouter>,
);
