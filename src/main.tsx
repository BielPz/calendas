//import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./main.css";
import TelaInicial from "./pages/TelaInicial";
import TelaLogin from "./pages/TelaLogin";
import CadastroUsuario from "./pages/CadastroUsuario";
import CadastroPrestador from "./pages/CadastroPrestador";
import TelaCadastroRafa from "./pages/TelaCadastroRafa";
import TelaFeed from "./pages/TelaFeed";

const gradiente: string = "bg-gradient-to-br from-orange-400 to-purple-400";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TelaInicial cor_fundo={gradiente} />} />
      <Route path="/login" element={<TelaLogin />} />
      <Route path="/cadastrouser" element={<CadastroUsuario />} />
      <Route path="/cadastroprestador" element={<CadastroPrestador />} />
      <Route path="/cadastro" element={<TelaCadastroRafa />} />
      <Route path="/feed" element={<TelaFeed cor_fundo={gradiente}/>} />
    </Routes>
  </BrowserRouter>,
);
