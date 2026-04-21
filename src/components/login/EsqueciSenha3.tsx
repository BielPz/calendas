interface Props {
  onClick: (etapa: number) => void;
}

function EsqueciSenha3({ onClick }: Props) {
  return (
    <div className="max-w-md justify-center items-center bg-white p-6 rounded-lg shadow-md px-10 flex flex-col gap-6">
      <button
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors self-start"
        onClick={() => onClick(2)}
      >
        <span className="text-xl">←</span>
        <span className="text-sm font-medium">Voltar</span>
      </button>
      <p className="text-lg font-medium text-gray-700 mb-4 text-center">
        Aqui você pode criar uma nova senha para sua conta.
      </p>
      {/* Adicione os campos para nova senha e confirmação de senha aqui */}
    </div>
  );
}

export default EsqueciSenha3;
