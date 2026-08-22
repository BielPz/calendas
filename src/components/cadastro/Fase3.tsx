import { useEffect, useState } from "react";
import CheckBox from "../utils/CheckBox";
import Formulario from "../utils/Formulario";

interface Props {
  onValidate?: (valid: boolean) => void;
}

function Fase3({ onValidate }: Props) {
  const [checks, setChecks] = useState({
    termos: false,
    notificacoes: false,
  });

  useEffect(() => {
    onValidate?.(checks.termos); // só termos obrigatório
  }, [checks]);

  return (
    <>
      <Formulario>
        <h1 className="font-bold text-4xl py-6">Termos de Uso</h1>
        <div className="overflow-auto h-70 border p-2 border-gray-400 rounded-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
          Lorem ipsum dolor sit amet. Et corporis aliasNam galisum non culpa
          molestiae quo nostrum doloremque rem earum provident eum
          necessitatibus vero At amet nemo. Rem tempora beatae in quas
          possimusNon quis sed dolorem ipsam nam laborum error aut velit vitae
          qui velit repudiandae? Eos voluptatem teneturEx eius sit molestias
          cumque eum galisum laudantium. Sed inventore ipsum At quisquam culpa
          Ut enim est accusantium quia aut itaque laborum. Aut deleniti rerum
          qui omnis officiisid autem. Qui fugiat sapienteEt eaque ut sint
          cupiditate est accusantium blanditiis ut pariatur voluptates non
          cupiditate dolores. Sed rerum obcaecati Nam aliquam vel dolorem
          eveniet aut rerum pariatur. Sit illum facilis et facere modiaut
          laudantium ut iure rerum non repellat aliquid. Aut dolorem itaque est
          officia molestiaeUt aliquid 33 quia dicta ad rerum animi et autem
          quam. Eos velit quisNon perferendis ex dolor voluptatem sit voluptatem
          sequi ut voluptatem provident qui blanditiis consequatur qui culpa
          impedit. In quae cumque ut rerum suntCum itaque. Quo eveniet iustoHic
          quasi et repudiandae cupiditate est corrupti voluptatem non doloremque
          libero non unde quam? Aut distinctio itaqueSed beatae et suscipit quia
          qui debitis aliquam eos eaque obcaecati est perspiciatis iure ea
          adipisci debitis. Et dolorem optioEa porro vel quis inventore et autem
          maxime et nulla quis.
        </div>
        <CheckBox
          message="Eu aceito os termos e condições"
          onChange={(e) =>
            setChecks((prev) => ({ ...prev, termos: e.target.checked }))
          }
        />
        <CheckBox
          message="Gostaria de receber e-mail e notificações do site"
          onChange={(e) =>
            setChecks((prev) => ({ ...prev, notificacoes: e.target.checked }))
          }
        />
      </Formulario>
    </>
  );
}

export default Fase3;
