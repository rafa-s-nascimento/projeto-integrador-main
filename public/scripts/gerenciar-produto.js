class Gerenciar {
    constructor(data) {
        this.arrayData = data;

        this.gerenciar = null;
    }
}

const fecharBtn = document.querySelector(".fechar-gerenciar-produto");
const modal = document.querySelector(".modal-gerenciar-produto");

let gerenciar = null;

export const gerenciarProdutos = (data) => {
    console.log(data);

    exibirProdutos(data);
};

const fecharModal = () => {
    const modal = document.querySelector(".modal-gerenciar-produto");
    modal.classList.remove("open");
};
fecharBtn.addEventListener("click", fecharModal);

const exibirProdutos = (produtos) => {
    const produtosContainer = document.querySelector(".produtos-container");

    produtosContainer.innerHTML = produtos
        .map(({ id, nome, intencao, img, visivel, disponivel }) => {
            return `<article class="item" data-id="${id}">
                                <span class="objetivo-produto">${intencao}</span>
                                <div class="container-img">
                                    <img
                                        src=${img}
                                        alt=${nome}
                                    />
                                </div>
                                <p class="nome-produto">
                                    ${nome}
                                </p>
                                <div class="tag-produto">
                                    <p class="categoria-produto">${
                                        visivel ? "visível" : "oculto"
                                    }</p>
                                    <p class="tipo-produto">${
                                        disponivel
                                            ? "disponível"
                                            : "indisponível"
                                    }</p>
                                </div>

                                <div class="container-id">                                
                                    <button
                                        class="alterar-produto-btn"
                                    >
                                        <i class="fa-solid fa-gear"></i>
                                        alterar
                                    </button>

                                    <span><span><i class="fa-solid fa-circle-exclamation"></i></span>${id}</span>
                                </div>
                            </article>`;
        })
        .join("");

    const alterar = [...document.querySelectorAll(".alterar-produto-btn")];

    alterar.forEach((node) => {
        node.addEventListener("click", () => {
            modal.classList.add("open");
        });
    });
};
