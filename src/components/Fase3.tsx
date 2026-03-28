import CheckBox from "./CheckBox";
import Formulario from "./Formulario";
import Index from "./Index";

function Fase3() {
  return (
    <div className="w-full justify-items-center">
      <Formulario titulo="Prestador">
        <Index qntPages={3} itemOn="3" />
        <div></div>
        <CheckBox message="Declaro que os dados acima são legítimos" />
        <CheckBox message="Declaro que os dados acima são legítimos" />
      </Formulario>
    </div>
  );
}

export default Fase3;
