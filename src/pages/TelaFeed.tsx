import Cabecalho from "../components/Cabecalho";
interface Props {
  cor_fundo: string;
}

function TelaFeed({ cor_fundo }: Props) {
  return (
    <div className={`${cor_fundo} min-h-screen w-full flex flex-col`}>
      <Cabecalho />
      <div className="flex flex-col flex-grow w-full items-center">
        <div className="flex flex-col w-full max-w-[80%] gap-4 p-4 flex-grow">
          <input
            type="text"
            className="bg-white w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
          />
          <div className="flex gap-3 flex-grow">
            <div className="bg-white w-1/5 p-3 rounded-lg"></div>
            <div className="bg-white w-4/5 p-3 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaFeed;
