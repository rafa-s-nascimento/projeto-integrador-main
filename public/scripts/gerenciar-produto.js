import { ajustes } from "./comum.js";

const fecharBtn = document.querySelector(".fechar-gerenciar-produto");
const modal = document.querySelector(".modal-gerenciar-produto");

let gerenciar = null;

export const gerenciarProdutos = () => {
    exibirProdutos();
};

const fecharModal = () => {
    gerenciar.encerrar();
    gerenciar = null;

    const modal = document.querySelector(".modal-gerenciar-produto");
    modal.classList.remove("open");
};
fecharBtn.addEventListener("click", fecharModal);

const replaceFileInput = () => {
    const oldInput = document.querySelector(`.img-input`);

    const input = document.createElement("input");
    input.type = "file";
    input.name = "img";
    input.setAttribute("multiple", "");
    input.classList.add("img");
    input.classList.add("img-input");

    oldInput.parentElement.replaceChild(input, oldInput);
};

const exibirProdutos = () => {
    const produtosContainer = document.querySelector(".produtos-container");

    const produtos = JSON.parse(sessionStorage.getItem("produtos"));

    produtosContainer.innerHTML = produtos
        .map(({ id, nome, intencaoId, produtoImg, visivel, disponivel }) => {
            return `<article class="item" data-id="${id}">
                                <span class="objetivo-produto">${intencaoId}</span>
                                <div class="container-img">
                                    <img
                                        src=${produtoImg[0]["img_path"]}
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

                                    <span># ${id}</span>
                                </div>
                            </article>`;
        })
        .join("");

    const alterar = [...document.querySelectorAll(".alterar-produto-btn")];

    alterar.forEach((node) => {
        node.addEventListener("click", (e) => {
            modal.classList.add("open");

            const id = e.currentTarget.parentElement.parentElement.dataset.id;

            gerenciar = new Gerenciar(Number(id));
        });
    });
};

class Gerenciar {
    constructor(id) {
        this.id = id;
        this.img = [];
        this.fetchDataValue = null;

        // form
        this.form = document.querySelector(".form");

        this.nome = this.form.querySelector(".nome-input");
        this.intencao = this.form.querySelector(".intencao-input");
        this.descricao = this.form.querySelector(".descricao-input");
        this.categoria = this.form.querySelector(".categoria-input");
        this.tipo = this.form.querySelector(".tipo-input");
        this.condicao = this.form.querySelector(".condicao-input");
        this.visivel = this.form.querySelector(".visivel-input");

        this.imgRecebida = this.form.querySelector(".container-img-atual");

        this.imgForm = null;

        // buttons
        this.confirmarBtn = document.querySelector(".cadastrar-btn");
        this.excluirBtn = document.querySelector(".excluir-btn");

        // faz com que o método confirmar sempre aponte para o objeto
        this._confirmarHandler = this._confirmar.bind(this);
        this._excluirHandler = this._excluir.bind(this);

        this._iniciar();
    }

    async _iniciar() {
        this.confirmarBtn.addEventListener("click", this._confirmarHandler);
        this.excluirBtn.addEventListener("click", this._excluirHandler);

        const loading = document.querySelector(".loading");
        loading.classList.add("show");

        try {
            const response = await fetch(
                `http://localhost:5000/products/${this.id}`
            );

            if (response.status != 200) {
                throw new Error("falha ao carregar produto");
            }

            const { data } = await response.json();

            this.fetchDataValue = data;

            this._setFormValues(this.fetchDataValue);
        } catch (error) {
            console.log(error);
            fecharModal();
        }

        loading.classList.remove("show");
    }

    _setFormValues(formDataValues) {
        const {
            nome,
            descricao,
            categoria,
            condicao,
            img,
            intencao,
            tipo,
            visivel,
        } = formDataValues;

        const selectInputs = [categoria, condicao, intencao, tipo];

        this.form.querySelector(".nome-input").value = nome;
        this.form.querySelector(".descricao-input").value = descricao;
        this._setOptionValue(this.categoria, categoria);
        this._setOptionValue(this.condicao, condicao);
        this._setOptionValue(this.intencao, intencao);
        this._setOptionValue(this.tipo, tipo);

        this.img = img;
        this._setImgValue(this.img);

        replaceFileInput();

        this.imgForm = this.form.querySelector(".img-input");

        if (visivel) {
            this.visivel.checked = true;
        } else {
            this.visivel.checked = false;
        }
    }

    _setOptionValue(node, value) {
        const options = [...node.options];

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            if (option.value === value) {
                option.selected = true;
            }
        }
    }
    _setImgValue(arr_imgs) {
        // const miniImgContainer = document.querySelector(".container-img-atual");

        this.imgRecebida.innerHTML = arr_imgs
            .map(
                (obj_img) => `<div
                                                class="container-img-produto-miniatura"
                                                data-id=${obj_img.id}
                                            >
                                                <span
                                                    class="img-produto-miniatura-excluir"
                                                >
                                                    <i
                                                        class="fa-solid fa-square-xmark"
                                                    ></i>
                                                </span>
                                                <img
                                                    src=${obj_img.src}
                                                    alt=""
                                                />
                                            </div>`
            )
            .join("");

        const excluirImgBtn = [
            ...document.querySelectorAll(".img-produto-miniatura-excluir"),
        ];

        excluirImgBtn.forEach((img) =>
            img.addEventListener("click", (e) => {
                const id = e.currentTarget.parentElement.dataset.id;

                this._removeImg(id);
            })
        );
    }
    _removeImg(id) {
        if (this.img.length < 2) {
            throw new Error(
                "Não é permitido excluir todas as imagens do produto"
            );
        }

        this.img = this.img.filter((obj_img) => obj_img.id !== Number(id));

        this._setImgValue(this.img);
    }

    _confirmar() {
        console.log(this.fetchDataValue);

        const alteracoes = {};

        const form = [
            this.nome,
            this.intencao,
            this.descricao,
            this.categoria,
            this.tipo,
            this.condicao,
        ];

        if (this.nome.value.length <= 0 || this.descricao.value.length <= 0) {
            alert("O nome e/ou descrição não podem permanecer em branco!");
            return;
        }

        form.forEach((input) => {
            if (!(input.value === this.fetchDataValue[input.name])) {
                alteracoes[input.name] = input.value;
            }
        });

        if (this.visivel.checked !== this.fetchDataValue.visivel) {
            alteracoes["visivel"] = this.visivel.checked;
        }

        if (
            this.imgRecebida.childNodes.length !==
            this.fetchDataValue.img.length
        ) {
            console.log("houveram imagens excluídas");

            let imgs = document.querySelector(
                ".container-img-atual"
            ).childNodes;

            const idImagensQueRestaram = [];

            imgs.forEach((node) =>
                idImagensQueRestaram.push(Number(node.dataset.id))
            );

            const imgsExcluidas = this.fetchDataValue.img.filter(
                (obj_img) => !idImagensQueRestaram.includes(obj_img.id)
            );

            alteracoes["imgExcluidas"] = JSON.stringify(imgsExcluidas);
        }

        if (this.imgForm.files.length > 0) {
            console.log(this.imgForm.files);
            console.log(this.imgForm.files.length);

            alteracoes["img"] = this.imgForm.files;
        }

        console.log(alteracoes);

        this._enviar(alteracoes);
    }

    async _enviar(obj_alteracoes) {
        if (Object.keys(obj_alteracoes).length !== 0) {
            const form = new FormData();

            for (const chave in obj_alteracoes) {
                if (chave === "img") {
                    for (let i = 0; i < obj_alteracoes[chave].length; i++) {
                        form.append("img", obj_alteracoes[chave][i]);
                    }
                }

                form.append(chave, obj_alteracoes[chave]);
            }

            form.append("id", this.id);

            try {
                const response = await fetch(
                    `http://localhost:5000/gerenciar/minha-conta/alterar`,
                    {
                        method: "PUT",
                        body: form,
                    }
                );

                if (response.status === 201) {
                    location.reload();
                }
            } catch (error) {
                console.log(error);
            }

            console.log("enviando data");

            // location.reload();
        }

        fecharModal();
    }
    async _excluir() {
        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/alterar/excluir/${this.id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.status === 201) {
                location.reload();
            }
        } catch (error) {
            console.log(error);
        }

        console.log("excluindo produto");
        fecharModal();
    }
    encerrar() {
        this.confirmarBtn.removeEventListener("click", this._confirmarHandler);
        this.excluirBtn.removeEventListener("click", this._excluirHandler);
    }
}
