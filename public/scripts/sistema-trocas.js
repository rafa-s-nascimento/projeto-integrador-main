import { ajustes } from "./comum.js";
const { validarCookie } = ajustes;

const acordoBtn = document.querySelector(".acordo-btn");
const fecharModal = document.querySelector(".close-btn");
const modal = document.querySelector(".modal");

const url = window.location.search;

let propostaAberta = null;

const encerrar = () => {
    modal.classList.remove("open");
    propostaAberta.fechando_proposta_de_troca();
    propostaAberta = null;
};

acordoBtn.addEventListener("click", () => {
    const valid = validarCookie("token");

    if (!valid) {
        window.location.href = "/login";
        return;
    }

    modal.classList.add("open");

    const searchParams = new URLSearchParams(url);
    console.log(searchParams.get("id"));

    const produto_id = searchParams.get("id");

    propostaAberta = new Proposta(produto_id);
    propostaAberta.abrindo_proposta();
});

fecharModal.addEventListener("click", encerrar);

class Proposta {
    constructor(produto_id) {
        this.id_dono_do_produto = null;
        this.produto_alvo_id = produto_id;
        this.cesta_de_trocas = [];
        this.produtos_usuario_interessado = null;
        this.id_usuario_interessado = null;

        this.confirmar = document.querySelector(".enviar-proposta-btn");
        this.confirmar.addEventListener("click", this.enviar_proposta);

        this.container_alvo = document.querySelector(
            ".container-produtos-alvo"
        );
        this.container_ofereco = document.querySelector(
            ".container-produtos-adicionados"
        );
        this.container_possuo = document.querySelector(
            ".container-produtos-disponiveis"
        );
        this.alterar_trocas = null;
    }

    // esse método é responsável por pegar os dados para começar a proposta de troca
    abrindo_proposta = async () => {
        console.log("abrindo proposta");

        // adicionar o spinner
        const loading = document.querySelector(".loading");
        loading.classList.add("show");

        // fazer o fetch para trazer os dados
        try {
            const response = await fetch(
                `http://localhost:5000/products/proposta/${this.produto_alvo_id}`
            );

            if (response.status !== 200) {
                throw new Error("Não foi possível efetuar a proposta");
            }

            const data = await response.json();

            // remover o spinner quando a resposta

            if (data) {
                const { proprietario, interessado } = data;

                console.log(proprietario);
                console.log(interessado);

                this.id_dono_do_produto = proprietario.user.id;
                this.id_usuario_interessado = interessado.user.id;

                this.produtos_usuario_interessado = interessado.produto;

                this._renderizarItens(
                    proprietario.produto,
                    this.container_alvo
                );
                this._renderizarItens(
                    this.produtos_usuario_interessado,
                    this.container_possuo,
                    true
                );
            }
        } catch (error) {
            console.log(error);
            encerrar();
        }

        loading.classList.remove("show");
    };

    // esse método valida e adiciona o produto a cesta de trocas
    adicionar_produto_para_troca = (id) => {
        console.log(this.cesta_de_trocas);
        console.log(this.produtos_usuario_interessado);
        console.log(id);

        if (this.cesta_de_trocas.some((product) => product.id == id)) {
            console.log("o produto já está na cesta");
            return;
        }
        const item = this.produtos_usuario_interessado.find(
            (product) => product.id == id
        );

        this.cesta_de_trocas.push(item);
        this.produtos_usuario_interessado =
            this.produtos_usuario_interessado.filter(
                (product) => product.id != id
            );
        console.log("adicionando produto a grade de trocas");

        console.log(this.cesta_de_trocas);
        console.log(this.produtos_usuario_interessado);

        this._renderizarItens(
            this.cesta_de_trocas,
            this.container_ofereco,
            true
        );
        this._renderizarItens(
            this.produtos_usuario_interessado,
            this.container_possuo,
            true
        );
    };

    // esse método valida e retira um produto da troca
    remover_produto_da_troca = (id) => {
        if (
            this.produtos_usuario_interessado.some(
                (product) => product.id == id
            )
        ) {
            console.log("o produto já foi retirado da cesta");
            return;
        }
        const item = this.cesta_de_trocas.find((product) => product.id == id);

        this.produtos_usuario_interessado.push(item);
        this.cesta_de_trocas = this.cesta_de_trocas.filter(
            (product) => product.id != id
        );
        console.log("removendo produto da grade de trocas");

        console.log(this.cesta_de_trocas);
        console.log(this.produtos_usuario_interessado);

        this._renderizarItens(
            this.cesta_de_trocas,
            this.container_ofereco,
            true
        );
        this._renderizarItens(
            this.produtos_usuario_interessado,
            this.container_possuo,
            true
        );
    };

    // esse método e responsável por enviar a proposta para o servidor
    enviar_proposta = async () => {
        if (this.cesta_de_trocas.length < 1) {
            alert("insira pelo menos um produto para troca.");
            return;
        }

        // fazer um put para o servidor com os dados da troca
        console.log("enviando proposta de troca");

        const data = {
            requisitado: {
                id: this.id_dono_do_produto,
                produto: { id: Number(this.produto_alvo_id) },
            },
            requisitante: {
                id: this.id_usuario_interessado,
                produto: this.cesta_de_trocas.map((produto) => {
                    return { id: produto.id };
                }),
            },
        };

        try {
            const response = await fetch(
                `http://localhost:5000/products/proposta`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.status !== 201) {
                const mensagem = await response.json();
                const { msg } = mensagem;

                throw new Error(msg);
            }
        } catch (error) {
            console.log(error);
        }

        encerrar();
    };

    // esse método encerra a proposta sem enviar, resetando os dados.
    fechando_proposta_de_troca = () => {
        console.log("fechando proposta");

        this.confirmar.removeEventListener("click", this.enviar_proposta);
        this.container_alvo.innerHTML = "";
        this.container_ofereco.innerHTML = "";
        this.container_possuo.innerHTML = "";
    };

    // esse método é privado, ele é responsável por renderizar e exibir os
    // produtos na tela, a cada adição ou exclusão.
    _renderizarItens = (produtos, parentElement) => {
        parentElement.innerHTML = "";

        if (produtos < 1) {
            return;
        }

        produtos.forEach(({ id, img: { src }, nome, cateogoria, tipo }) => {
            const article = document.createElement("article");
            const containerImg = document.createElement("div");
            const imagem = document.createElement("img");
            const titulo = document.createElement("p");
            const tagProdutos = document.createElement("div");
            const categoriaProduto = document.createElement("p");
            const tipoProduto = document.createElement("p");
            const linkContainer = document.createElement("div");
            const a = document.createElement("a");
            const alterarBtn = document.createElement("button");

            article.classList.add("single-product-miniatura");
            article.setAttribute("data-id", id);
            article.classList.add("item");

            containerImg.classList.add("container-img");
            // imagem.classList.add("img");
            imagem.setAttribute("alt", nome);
            imagem.setAttribute("src", src);
            containerImg.appendChild(imagem);
            article.appendChild(containerImg);

            titulo.classList.add("nome-produto");
            titulo.textContent = nome;
            article.appendChild(titulo);

            tagProdutos.classList.add("tag-produto");
            categoriaProduto.classList.add("categoria-produto");
            categoriaProduto.textContent = `#${cateogoria}`;
            tipoProduto.classList.add("tipo-produto");
            tipoProduto.textContent = `#${tipo}`;
            tagProdutos.appendChild(categoriaProduto);
            tagProdutos.appendChild(tipoProduto);
            tagProdutos.classList.add("display-none");
            article.appendChild(tagProdutos);

            linkContainer.classList.add("link-container");
            a.classList.add("link-produto");
            a.setAttribute("href", `./detalhe-produto.html?id=${id}`);
            a.setAttribute("target", "_blank");
            a.textContent = "Ver produto";
            linkContainer.appendChild(a);

            alterarBtn.classList.add("btn");
            alterarBtn.classList.add("single-product-miniatura-alterar");
            alterarBtn.textContent =
                parentElement.dataset.tipo === "possui"
                    ? "adicionar"
                    : "remover";

            if (parentElement.dataset.tipo === "alvo") {
                alterarBtn.classList.add("ocutar-btn");
            }

            linkContainer.appendChild(alterarBtn);
            article.appendChild(linkContainer);

            parentElement.appendChild(article);
            return;
        });

        this.alterar_trocas = [
            ...document.querySelectorAll(".single-product-miniatura-alterar"),
        ];

        this.alterar_trocas.forEach((node) =>
            node.addEventListener("click", (e) => {
                const text = e.currentTarget.textContent;
                const id =
                    e.currentTarget.parentElement.parentElement.dataset.id;
                text == "adicionar"
                    ? this.adicionar_produto_para_troca(id)
                    : this.remover_produto_da_troca(id);
            })
        );
    };
}
