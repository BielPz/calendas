// Função para fazer upload de imagem para o Cloudinary
// Esta função recebe um arquivo (File) e retorna a URL segura da imagem após o upload
export const uploadImage = async (file: File) => {
  const formData = new FormData(); // Criamos um objeto FormData para enviar os dados do arquivo e o preset de upload
  formData.append("file", file); // Adicionamos o arquivo ao FormData
  formData.append("upload_preset", "empresa"); // Adicionamos o preset de upload (substitua "empresa" pelo seu preset real)

  // Fazemos a requisição POST para a API do Cloudinary

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dgjquy40u/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  // Verificamos se a resposta foi bem-sucedida
  if (!res.ok) {
    throw new Error("Erro ao fazer upload da imagem");
  }
  // Se a resposta for bem-sucedida, extraímos os dados JSON e retornamos a URL segura da imagem
  const data = await res.json();
  return data.secure_url;
};