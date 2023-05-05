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
        this.statusGeral = null;
        this.propostasObj = {};
    }

    expandir(node) {
        node.classList.toggle("show");
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
        span2.textContent = "disponível";

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
        divInfo.appendChild(span2);
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

        article.appendChild(divInfo);
        article.appendChild(containerProposta);

        return article;
    }
}

class Proposta {
    constructor(produto, proposta_info, proposta_efetuada_ou_recebida) {
        this.parentElementObj = produto;
        this.tipo = proposta_efetuada_ou_recebida;
        this.status = null;
        this.id = proposta_info.id;
        this.data = proposta_info.data_proposta;
        this.id_produto_requisitado =
            proposta_info.proposta_produtos[0]["id_produto_requisitado"];
        this.id_produtos_oferecidos = proposta_info.proposta_produtos.map(
            (obj) => obj.id_produto_oferecido
        );

        // this.verificarData();
    }

    aceitar_proposta() {
        console.log("proposta de número " + this.id + "aceita!");
        console.log(this.id);
    }
    recusar_proposta() {
        console.log("proposta recusada " + this.id);
    }
    exibir_proposta() {
        console.log("exibindo proposta" + this.id);
    }
    cancelar_proposta() {
        console.log("cancelando propostas " + this.id);
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
        statusProposta.textContent = "status: ativa";
        article.appendChild(statusProposta);

        const dataProposta = document.createElement("span");
        dataProposta.classList.add("proposta-individual-produto-data-proposta");
        dataProposta.textContent = this.data
            .slice(0, 11)
            .split("-")
            .reverse()
            .join("/");
        article.appendChild(dataProposta);

        const containerDecisaoBtn = document.createElement("div");
        containerDecisaoBtn.classList.add(
            "container-proposta-individual-produto-decisao-btn-aceitar"
        );

        const recusarBtn = document.createElement("button");
        recusarBtn.classList.add(
            "container-proposta-individual-produto-decisao-btn-recusar"
        );

        if (this.tipo === "efetuadas") {
            recusarBtn.textContent = "cancelar";
            this.cancelar_proposta = this.cancelar_proposta.bind(this);
            recusarBtn.addEventListener("click", this.cancelar_proposta);
            containerDecisaoBtn.appendChild(recusarBtn);
            article.appendChild(containerDecisaoBtn);
            return article;
        }

        recusarBtn.textContent = "recusar";
        this.recusar_proposta = this.recusar_proposta.bind(this);
        recusarBtn.addEventListener("click", this.recusar_proposta);

        containerDecisaoBtn.appendChild(recusarBtn);

        this.exibir_proposta = this.exibir_proposta.bind(this);
        verProposta.addEventListener("click", this.exibir_proposta);

        const aceitarBtn = document.createElement("button");
        aceitarBtn.classList.add(
            "container-proposta-individual-produto-decisao-btn"
        );

        aceitarBtn.textContent = "aceitar";
        this.aceitar_proposta = this.aceitar_proposta.bind(this);
        aceitarBtn.addEventListener("click", this.aceitar_proposta);

        containerDecisaoBtn.appendChild(aceitarBtn);
        article.appendChild(containerDecisaoBtn);

        return article;
    }
}
