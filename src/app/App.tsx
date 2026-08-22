import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/utils/ProtectedRoute";
import { AlertaProvider } from "@/provider/AlertContext";
import { ThemeProvider } from "@/provider/ThemeContext";
import AppErrorBoundary from "@/components/utils/AppErrorBoundary";
import Loading from "@/components/utils/Loading";

const TelaInicial = lazy(() => import("@/pages/TelaInicial"));
const TelaLogin = lazy(() => import("@/pages/TelaLogin"));
const TelaCadastro = lazy(() => import("@/pages/TelaCadastro"));
const TelaFeed = lazy(() => import("@/pages/TelaFeed"));
const TelaEsqueciSenha = lazy(() => import("@/pages/TelaEsqueciSenha"));
const TelaResetSenha = lazy(() => import("@/pages/TelaResetSenha"));
const TelaCriarServico = lazy(() => import("@/pages/TelaCriarServico"));
const TelaPerfil = lazy(() => import("@/pages/TelaPerfil"));
const TelaCalendario = lazy(() => import("@/pages/TelaCalendario"));
const TelaAgendamento = lazy(() => import("@/pages/TelaAgendamento"));
const TelaCriarEmpresa = lazy(() => import("@/pages/TelaCriarEmpresa"));
const TelaServico = lazy(() => import("@/pages/TelaServico"));
const TelaEmpresa = lazy(() => import("@/pages/TelaEmpresa"));
const TelaNotificacoes = lazy(() => import("@/pages/TelaNotificacoes"));
const TelaMensagens = lazy(() => import("@/pages/TelaMensagens"));

const proteger = (element: React.ReactNode) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

export default function App() {
  return (
    <BrowserRouter>
      <AlertaProvider>
        <ThemeProvider>
          <AppErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<TelaInicial />} />
                <Route path="/login" element={<TelaLogin />} />
                <Route path="/cadastro" element={<TelaCadastro />} />
                <Route path="/esqueci-senha" element={<TelaEsqueciSenha />} />
                <Route path="/reset-senha" element={<TelaResetSenha />} />
                <Route path="/feed" element={proteger(<TelaFeed />)} />
                <Route
                  path="/gerenciar-servico"
                  element={proteger(<TelaCriarServico />)}
                />
                <Route
                  path="/cadastro-servico"
                  element={<Navigate to="/gerenciar-servico" replace />}
                />
                <Route path="/perfil" element={proteger(<TelaPerfil />)} />
                <Route
                  path="/calendario"
                  element={proteger(<TelaCalendario />)}
                />
                <Route
                  path="/agendamento"
                  element={proteger(<TelaAgendamento />)}
                />
                <Route
                  path="/servicos/:idServico"
                  element={proteger(<TelaServico />)}
                />
                <Route
                  path="/empresas/:idEmpresa"
                  element={proteger(<TelaEmpresa />)}
                />
                <Route
                  path="/cadastro-empresa"
                  element={proteger(<TelaCriarEmpresa />)}
                />
                <Route
                  path="/notificacoes"
                  element={proteger(<TelaNotificacoes />)}
                />
                <Route
                  path="/mensagens"
                  element={proteger(<TelaMensagens />)}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppErrorBoundary>
        </ThemeProvider>
      </AlertaProvider>
    </BrowserRouter>
  );
}
