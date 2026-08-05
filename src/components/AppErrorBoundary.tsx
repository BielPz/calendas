import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro não tratado na apliação", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center dark:bg-zinc-900">
          <h1 className="text-xl font-bold dark:text-white">
            Não foi possível carregar esta página.
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Atualize a página ou volte ao início para continuar.
          </p>
          <button
            className="ui-button-primary"
            onClick={() => window.location.assign("/")}
          >
            Voltar ao início
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
