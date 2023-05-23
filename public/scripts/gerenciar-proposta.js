import { ajustes } from "./comum.js";

export const tratarProposta = (arr_produtos, tipo) => {
    const produtosObj = {};

    const propostasRecebidasContainer = document.querySelector(
        ".propostas-recebidas-container"
    );
    const propostasEfetuadasContainer = document.querySelector(
        ".propostas-enviadas-container"
    );

    arr_produtos.forEach((produto, index) => {
        if (tipo === "recebidas") {
            produtosObj["produto" + index] = new PropostaProduto(produto, tipo);

            propostasRecebidasContainer.appendChild(
                produtosObj["produto" + index].criarNode()
            );
        } else {
            produtosObj["produto" + index] = new PropostaProduto(produto, tipo);

            propostasEfetuadasContainer.appendChild(
                produtosObj["produto" + index].criarNode()
            );
        }
    });

    // for (chave in obj_propostas) {
    // }
};

class PropostaProduto {
    constructor(produto, tipo) {
        this.tipo = tipo;
        this.produto = produto;
        this.id = produto.id;
        this.proposta = produto.propostas;
        this.propostasObj = {};
        this.statusGeralHtml = null;
        this.statusGeral = null;
    }

    setHtmlStatus() {
        this.statusGeralHtml.textContent = this.statusGeral;
    }
    setStatus(status) {
        this.statusGeral = status;
    }

    expandir(node) {
        node.classList.toggle("show");
    }
    bloquearPropostas() {
        console.log("bloqueando propostas");

        for (const proposta in this.propostasObj) {
            if (this.propostasObj[proposta].status == "ativa") {
                this.propostasObj[proposta].setStatus("indisponível");
                this.propostasObj[proposta].setHtmlStatus();
                this.propostasObj[proposta].removeEventListeners();
            }
        }
    }

    criarNode() {
        const article = document.createElement("article");
        article.classList.add("proposta-produto");
        article.setAttribute("data-id", this.id);

        const divInfo = document.createElement("div");
        divInfo.classList.add("proposta-produto-info");

        const span1 = document.createElement("span");
        span1.textContent = `# ${this.id}`;

        const span2 = document.createElement("span");
        this.statusGeralHtml = span2;
        this.statusGeralHtml.textContent =
            this.tipo == "recebidas" ? "disponível" : "enviado";

        const chatBtn1 = document.createElement("button");
        chatBtn1.classList.add("chat-btn", "status-btn");

        const i1 = document.createElement("i");
        i1.classList.add("fa-solid", "fa-message");
        chatBtn1.appendChild(i1);

        const expandirBtn = document.createElement("button");
        expandirBtn.classList.add("expandir-btn", "status-btn");

        const i2 = document.createElement("i");
        i2.classList.add("fa-solid", "fa-chevron-down");
        expandirBtn.appendChild(i2);

        divInfo.appendChild(span1);
        divInfo.appendChild(this.statusGeralHtml);
        divInfo.appendChild(chatBtn1);

        const containerProposta = document.createElement("div");
        containerProposta.classList.add(
            "container-proposta-individual-produto"
        );

        this.expandir = this.expandir.bind(this);
        expandirBtn.addEventListener("click", () => {
            this.expandir(containerProposta);
        });
        divInfo.appendChild(expandirBtn);

        this.proposta.forEach((proposta, index) => {
            this.propostasObj["proposta" + index] = new Proposta(
                this,
                proposta,
                this.tipo
            );

            containerProposta.appendChild(
                this.propostasObj["proposta" + index].criarNode()
            );
        });

        console.log(this.propostasObj);

        let propostaAceita = false;

        for (const proposta in this.propostasObj) {
            console.log(proposta);
            if (this.propostasObj[proposta].status === "aceita") {
                propostaAceita = true;
            }
        }

        if (propostaAceita) {
            this.setStatus("em negociação");
            this.setHtmlStatus();
            this.bloquearPropostas();
        }

        article.appendChild(divInfo);
        article.appendChild(containerProposta);

        return article;
    }
}

class Proposta {
    constructor(produto, proposta_info, proposta_efetuada_ou_recebida) {
        this.parentElementObj = produto;
        this.tipo = proposta_efetuada_ou_recebida;
        this.id = proposta_info.id;
        this.data = proposta_info.data_proposta;
        this.id_produto_requisitado =
            proposta_info.proposta_produtos[0]["id_produto_requisitado"];
        this.id_produtos_oferecidos = proposta_info.proposta_produtos.map(
            (obj) => obj.id_produto_oferecido
        );

        const setInicialStatus = () => {
            return proposta_info["proposta_ativa"]
                ? "ativa"
                : proposta_info["proposta_aceita"]
                ? "aceita"
                : proposta_info["proposta_recusada"]
                ? "recusada"
                : proposta_info["proposta_cancelada"]
                ? "cancelada"
                : "indisponível";
        };

        // console.log(proposta_info);

        this.status = setInicialStatus();

        this.statusHmtl = null;
        this.aceitaBtnHtml = null;
        this.recusarBtnHtml = null;
    }

    setHtmlStatus() {
        this.statusHmtl.textContent = "status: " + this.status;
    }
    setStatus(status) {
        this.status = status;
    }

    removeEventListeners() {
        this.recusarBtnHtml.removeEventListener("click", this.recusar_proposta);

        if (this.tipo === "recebidas") {
            this.aceitaBtnHtml.removeEventListener(
                "click",
                this.aceitar_proposta
            );
        }
    }
    exibir_proposta() {
        console.log("exibindo proposta" + this.id);
    }

    async aceitar_proposta() {
        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/aceitar/${this.id}`,
                {
                    method: "PUT",
                }
            );

            if (!response.status === 201) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { msg } = await response.json();

            console.log(msg);
            this.setStatus("aceita");
            this.setHtmlStatus();
            this.removeEventListeners();
            this.parentElementObj.bloquearPropostas();
            this.parentElementObj.setStatus("em negociação");
            this.parentElementObj.setHtmlStatus();

            location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    async recusar_proposta() {
        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/recusar/${this.id}`,
                {
                    method: "PUT",
                }
            );

            if (!response.status === 201) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { msg } = await response.json();

            console.log(msg + "id:" + this.id);
            this.setStatus("recusada");
            this.setHtmlStatus();
            this.removeEventListeners();
        } catch (error) {
            console.log(error);
        }
    }

    async cancelar_proposta() {
        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/cancelar/${this.id}`,
                {
                    method: "PUT",
                }
            );

            if (!response.status === 201) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { msg } = await response.json();

            console.log(msg + "id:" + this.id);
            this.setStatus("recusada");
            this.setHtmlStatus();
        } catch (error) {
            console.log(error);
        }

        console.log("cancelando propostas " + this.id);
        this.setStatus("cancelada");
        this.setHtmlStatus();
    }

    criarNode() {
        const article = document.createElement("article");
        article.setAttribute("data-id", this.id);
        article.classList.add("proposta-individual-produto");

        const verProposta = document.createElement("span");
        verProposta.classList.add("proposta-individual-produto-ver-proposta");

        const i = document.createElement("i");
        i.classList.add("fa-solid", "fa-magnifying-glass");
        verProposta.appendChild(i);
        verProposta.innerHTML += "visualizar";

        article.appendChild(verProposta);

        const statusProposta = document.createElement("span");
        statusProposta.classList.add(
            "proposta-individual-produto-status-proposta"
        );

        this.statusHmtl = statusProposta;
        this.statusHmtl.textContent = "status: " + this.status;
        article.appendChild(statusProposta);

        const dataProposta = document.createElement("span");
        dataProposta.classList.add("proposta-individual-produto-data-proposta");
        dataProposta.textContent = this.data
            .slice(0, 11)
            .split("-")
            .reverse()
            .join("/")
            .replace("T", "");

        article.appendChild(dataProposta);

        const containerDecisaoBtn = document.createElement("div");
        containerDecisaoBtn.classList.add(
            "container-proposta-individual-produto-decisao-btn-aceitar"
        );

        const recusarBtn = document.createElement("button");
        this.recusarBtnHtml = recusarBtn;
        this.recusarBtnHtml.classList.add(
            "container-proposta-individual-produto-decisao-btn-recusar"
        );

        if (this.tipo === "efetuadas") {
            this.recusarBtnHtml.textContent = "cancelar";
            this.cancelar_proposta = this.cancelar_proposta.bind(this);

            if (this.status === "ativa") {
                this.recusarBtnHtml.addEventListener(
                    "click",
                    this.cancelar_proposta
                );
            }

            containerDecisaoBtn.appendChild(this.recusarBtnHtml);
            article.appendChild(containerDecisaoBtn);
            return article;
        }

        this.recusarBtnHtml.textContent = "recusar";
        this.recusar_proposta = this.recusar_proposta.bind(this);
        if (this.status === "ativa") {
            this.recusarBtnHtml.addEventListener(
                "click",
                this.recusar_proposta
            );
        }
        this.exibir_proposta = this.exibir_proposta.bind(this);
        if (this.status === "ativa") {
            verProposta.addEventListener("click", this.exibir_proposta);
        }

        const aceitarBtn = document.createElement("button");
        this.aceitaBtnHtml = aceitarBtn;
        this.aceitaBtnHtml.classList.add(
            "container-proposta-individual-produto-decisao-btn"
        );

        this.aceitaBtnHtml.textContent = "aceitar";
        this.aceitar_proposta = this.aceitar_proposta.bind(this);
        if (this.status === "ativa") {
            this.aceitaBtnHtml.addEventListener("click", this.aceitar_proposta);
        }
        containerDecisaoBtn.appendChild(this.aceitaBtnHtml);
        containerDecisaoBtn.appendChild(recusarBtn);
        article.appendChild(containerDecisaoBtn);

        return article;
    }
}
