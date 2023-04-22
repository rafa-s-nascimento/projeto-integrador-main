import { requisicoes } from "./requisicao.js";
import { ajustes } from "./comum.js";

const cadastrarBtn = document.querySelector(".cadastrar-btn");

window.addEventListener("load", async function () {
    cadastrarBtn.addEventListener("click", () => {
        const nome = document.querySelector(".nome-input");
        const intencao = document.querySelector(".intencao-input");
        const categoria = document.querySelector(".categoria-input");
        const tipo = document.querySelector(".tipo-input");
        const condicao = document.querySelector(".condicao-input");
        const visivel = document.querySelector(".visivel-input");
        const img = document.querySelector(".img-input").files;
        const descricao = this.document.querySelector(".descricao-input");

        const form = new FormData();

        for (let i = 0; i < img.length; i++) {
            form.append("img", img[i]);
        }

        form.append("nome", nome.value);
        form.append("intencao", intencao.value);
        form.append("categoria", categoria.value);
        form.append("tipo", tipo.value);
        form.append("condicao", condicao.value);
        form.append("descricao", descricao.value);
        form.append("visivel", visivel.checked);

        if (
            img.length > 0 &&
            nome.value.length !== 0 &&
            descricao.value !== 0
        ) {
            const enviar = async () => {
                fetch("http://localhost:5000/cadastrar-produto", {
                    method: "POST",
                    body: form,
                }).catch((err) => console.log(err));
            };

            enviar();
        }
    });
});

ajustes.exibirInfoUsuario();
