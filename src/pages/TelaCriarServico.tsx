import { useEffect, useState } from "react";
import Formulario from "../components/Formulario"
import TextInput from "../components/TextInput"
import type { Servico } from "../firebase/types";
/*
interface Props 
{
    onValidate?: (valid: boolean) => void;
}
*/

function TelaCriarServico(/*{onValidate}: Props*/) {

    const [form, setForm] = useState<Servico>({
        cnpj: "",
        nome: "",
        preco: 0
    });

    const handleChange = (campo: string, value: string) => {
        const novoForm = { ...form, [campo]: value }        
        setForm((prev) => ({
            ...prev,
            [campo]: value,
        }));
    };

    const isValid = Boolean(
        form.cnpj &&
        form.nome &&
        form.preco
    );

    /*
    useEffect(() => {
        onValidate?.(isValid);
    }, [isValid]);
    */

    return(
        <div className="flex flex-col items-center justify-start min-h-screen">
            <div className="w-[45%] min-w-[300px] relative flex flex-col gap-3 justify-items-center">
                <Formulario>
                    <TextInput
                        titulo="CNPJ"
                        type="text"
                        onChange={(value) => handleChange("cnpj", value)}
                        cnpj
                        required
                    />
                    <TextInput
                        titulo="Nome"
                        type="text"
                        onChange={(value) => handleChange("nome", value)}
                        required
                    />
                    <TextInput
                        titulo="Descricao"
                        type="text"
                        onChange={(value) => handleChange("descricao", value)}
                        required
                    />
                    <TextInput
                        titulo="Preço"
                        type="text"
                        onChange={(value) => handleChange("preco", value)}
                        required
                    />
                </Formulario>
            </div>
        </div>
        
    )
}

export default TelaCriarServico