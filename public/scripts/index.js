import { ajustes } from "./comum.js";

window.addEventListener("DOMContentLoaded", async () => {
    const produtosContainer = document.querySelector(".produtos-container");

    try {
        const response = await fetch("http://localhost:5000/products?limit=20");

        if (response.status === 200) {
            const { data } = await response.json();

            renderizarItems(data, produtosContainer);
        }
    } catch (error) {
        console.log(error);
    }
});

ajustes.exibirInfoUsuario();

const renderizarItems = (data, parentElement) => {
    if (data.length < 1) {
        return (parentElement.innerHTML = `<h2>Nenhum produto encontrado...</h2>`);
    } else {
        const produtosHTML = data
            .map(
                ({ id, intencao, img, nome, categoria, tipo }) => `

            <article class="item" data-id="${id}">
                        <span class="objetivo-produto">${intencao}</span>
                        <div class="container-img">
                            <img
                                src="${img[0].src}"
                                alt="${nome}"
                            />
                        </div>
                        <p class="nome-produto">
                           ${nome}
                        </p>
                        <div class="tag-produto">
                            <p class="categoria-produto">#${categoria}</p>
                            <p class="tipo-produto">#${tipo}</p>
                        </div>
                        <a
                            href="./detalhe-produto.html?id=${id}"
                            class="link-produto"
                            target="_blank"
                            >Ver produto</a
                        >
            </article>`
            )
            .join("");

        parentElement.innerHTML = produtosHTML;
    }
};
