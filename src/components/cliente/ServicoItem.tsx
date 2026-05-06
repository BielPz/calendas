import { useEffect, useState } from "react";
import type { Servico } from "../../firebase/types";
import { getEmpresaPorId } from "../../firebase/database";
import imgErrorInternet from "../../images/erroInternet.jpg";
import { useAlerta } from "../../provider/AlertContext";

interface Props {
  servico: Servico;
}

function ServicoItem({ servico }: Props) {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [avaliacao, setAvaliacao] = useState(0);
  const [hover, setHover] = useState(0);
  const { showAlerta } = useAlerta();

  useEffect(() => {
    if (servico.idEmpresa) {
      getEmpresaPorId(servico.idEmpresa)
        .then((empresa) => setNomeEmpresa(empresa?.nome ?? ""))
        .catch((err) => {
          console.error("Erro ao carregar dados da empresa:", err);
          showAlerta(
            "Erro",
            "Não foi possível carregar os dados da empresa.",
            "erro",
          );
        });
    }
  }, [servico.idEmpresa]);

  return (
    <div className="flex flex-col sm:flex-row w-full bg-gray-100 rounded overflow-hidden">
      {/* Imagem à esquerda — dentro do próprio container */}
      <div className="bg-gray-200 sm:w-1/5 w-full min-h-20">
        {servico.banner ? (
          <img
            src={servico.banner}
            alt="banner do serviço"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = imgErrorInternet;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      <div className="sm:w-4/5 w-full p-3 flex flex-col gap-1 relative">
        {/* Botão favoritar */}
        <button
          onClick={() => setFavorito(!favorito)}
          className="absolute top-3 right-3 text-xl transition-colors duration-200"
        >
          {favorito ? "♥" : "♡"}
        </button>

        <p className="font-semibold">{servico.nome}</p>
        <p className="text-sm text-gray-400">{nomeEmpresa}</p>
        <p className="text-sm text-gray-500">{servico.descricao}</p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
          <span>R$ {servico.preco}</span>
          <span>
            Início: {servico.inicio} Término: {servico.fim}
          </span>
          <span>Duração: {servico.duracao} {servico.tempo}</span>
        </div>

        {/* Botão agendar e estrelas */}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <button className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            + Agendar
          </button>

          {/* Avaliação por estrelas */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <button
                key={estrela}
                onClick={() => setAvaliacao(estrela)}
                onMouseEnter={() => setHover(estrela)}
                onMouseLeave={() => setHover(0)}
                className="text-xl transition-colors duration-150"
              >
                <span
                  className={
                    (hover || avaliacao) >= estrela
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicoItem;
