//import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./main.css";
import TelaInicial from "./pages/TelaInicial";
import TelaLogin from "./pages/TelaLogin";
import CadastroUsuario from "./pages/CadastroUsuario";

const gradiente: string = "bg-gradient-to-br from-orange-400 to-purple-400";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TelaInicial cor_fundo={gradiente} />} />
      <Route path="/login" element={<TelaLogin />} />
      <Route path="/cadastrouser" element={<CadastroUsuario />} />
    </Routes>
  </BrowserRouter>,
);
