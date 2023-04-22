//Get

const get = async () => {
    const promisse = await fetch("http://localhost:5000/products");
    const data = await promisse.json();

    return data;
};

const requisicaoGet = fetch("http://localhost:5000/products").then(
    (response) => {
        async () => {
            console.log(response);
            const data = await response.json();
            console.log(data);
            return response.json();
        };
    }
);

//post
const requisicaoPost = (categoria, img, nome, descricao, preco) => {
    fetch("http://localhost:5000/produtos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            categoria: categoria,
            img: img,
            nome: nome,
            descricao: descricao,
            preco: preco,
        }),
    }).then((response) => {
        if (response.ok) {
            return response.body;
        }
    });
};

export const requisicoes = {
    requisicaoGet,
    requisicaoPost,
    get,
};
