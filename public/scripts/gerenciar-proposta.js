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
        this.propostaEmNegociacao = null;
        this.chat = null;
    }

    setHtmlStatus() {
        this.statusGeralHtml.classList.add("c-green2");
        this.statusGeralHtml.textContent = this.statusGeral;
    }
    setStatus(status) {
        this.statusGeral = status;
    }
    setpropostaEmNegociacao(id, tipo) {
        this.propostaEmNegociacao = id;
        console.log(tipo);
    }

    openChat() {
        if (!this.propostaEmNegociacao) return;

        if (!this.chat) {
            this.chat = new Chat(this.propostaEmNegociacao);
        }

        this.chat.openChat();
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

        this.openChat = this.openChat.bind(this);
        chatBtn1.addEventListener("click", () => {
            this.openChat();
        });

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

        let propostaAceita = false;

        for (const proposta in this.propostasObj) {
            if (this.propostasObj[proposta].status === "aceita") {
                propostaAceita = true;
            }
        }

        if (propostaAceita) {
            this.setStatus("em negociação");
            this.setHtmlStatus();
            this.bloquearPropostas();
            chatBtn1.classList.add("c-yellow");
        }

        this.statusGeralHtml.classList.add(
            this.statusGeral === "em negociação" ? "c-green2" : "c-green"
        );

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

        if (this.status == "aceita") {
            this.parentElementObj.setpropostaEmNegociacao(this.id, this.tipo);
        }
    }

    setHtmlStatus() {
        this.statusHmtl.firstElementChild.textContent = this.status;

        if (this.status == "aceita") {
            this.statusHmtl.firstElementChild.classList.remove("c-green");
            this.statusHmtl.firstElementChild.classList.add("c-green2");
        }
        if (this.status == "cancelada") {
            this.statusHmtl.firstElementChild.classList.remove("c-green");
            this.statusHmtl.firstElementChild.classList.add("c-red");
        }
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
    async exibir_proposta() {
        console.log("exibindo proposta" + this.id);
        console.log("proposta ativa ?" + this.status);
        const modal = document.querySelector(".chat-container");

        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/data/proposta/${this.id}`
            );

            if (!response.status === 200) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { data } = await response.json();

            const nodeElement = this.visualizarPropostaNode(data);
            modal.appendChild(nodeElement);
        } catch (error) {
            console.log(error);
        }

        console.log(
            "O(s) produto(s) " +
                this.id_produtos_oferecidos +
                " foram oferecidos em troca do produto " +
                this.id_produto_requisitado
        );

        modal.classList.add("show-chat");
    }

    fechar_exibir_proposta() {
        const modal = document.querySelector(".chat-container");
        modal.classList.remove("show-chat");
        modal.removeChild(modal.lastChild);
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
            this.parentElementObj.setpropostaEmNegociacao(this.id);

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
        console.log(this.status);

        const article = document.createElement("article");
        article.setAttribute("data-id", this.id);
        article.classList.add("proposta-individual-produto");

        const verProposta = document.createElement("span");
        verProposta.classList.add("proposta-individual-produto-ver-proposta");
        const br = document.createElement("br");

        const i = document.createElement("i");
        i.classList.add("fa-solid", "fa-magnifying-glass");
        verProposta.appendChild(i);
        verProposta.appendChild(br);
        verProposta.innerHTML += "visualizar";

        this.exibir_proposta = this.exibir_proposta.bind(this);
        if (this.status === "ativa" || this.status === "aceita") {
            verProposta.addEventListener("click", this.exibir_proposta);
        }
        article.appendChild(verProposta);

        const statusProposta = document.createElement("span");
        statusProposta.classList.add(
            "proposta-individual-produto-status-proposta"
        );

        const statusProposta2 = document.createElement("span");
        statusProposta2.classList.add(
            this.status == "ativa"
                ? "c-green"
                : this.status == "aceita"
                ? "c-green2"
                : "c-red"
        );

        const statusPropostaTex = document.createTextNode("status: ");
        const statusPropostaTex2 = document.createTextNode(this.status);
        statusProposta2.appendChild(statusPropostaTex2);

        statusProposta.appendChild(statusPropostaTex);
        statusProposta.appendChild(statusProposta2);

        this.statusHmtl = statusProposta;

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

    visualizarPropostaNode(proposta_obj) {
        console.log(proposta_obj);

        const divCenter = document.createElement("div");
        divCenter.className = "proposta-detalhe-center";

        const spanCloseBtn = document.createElement("span");
        spanCloseBtn.className = "proposta-detalhe-close-btn";
        const iconTimes = document.createElement("i");
        iconTimes.className = "fas fa-times";
        spanCloseBtn.appendChild(iconTimes);
        spanCloseBtn.addEventListener("click", this.fechar_exibir_proposta);
        divCenter.appendChild(spanCloseBtn);

        const divContainer = document.createElement("div");
        divContainer.className = "proposta-detalhe-container";

        const divProduto = document.createElement("div");
        divProduto.className = "proposta-detalhe-produto";

        const divUsuario1 = document.createElement("div");
        divUsuario1.className = "proposta-detalhe-usuario usuario1";

        const divUsuarioImgContainer1 = document.createElement("div");
        divUsuarioImgContainer1.className =
            "proposta-detalhe-usuario-img-container";

        const imgAvatar1 = document.createElement("img");
        imgAvatar1.src = proposta_obj.requisitado.avatar;
        imgAvatar1.alt = "avatar";

        // Adiciona o elemento <img> dentro do elemento <div>
        divUsuarioImgContainer1.appendChild(imgAvatar1);

        // Adiciona o elemento <div> dentro do elemento <div>
        divUsuario1.appendChild(divUsuarioImgContainer1);

        // Cria o elemento <p> com o texto 'Lorem, ipsum dolor.'
        const pLoremIpsum1 = document.createElement("p");
        pLoremIpsum1.textContent = proposta_obj.requisitado.nome;

        // Adiciona o elemento <p> dentro do elemento <div>
        divUsuario1.appendChild(pLoremIpsum1);

        // Adiciona o elemento <div> dentro do elemento <div>
        divProduto.appendChild(divUsuario1);

        // Cria o elemento <div> com a classe 'proposta-detalhe-produtos-c p-desejados'
        const divProdutosDesejados = document.createElement("div");
        divProdutosDesejados.className =
            "proposta-detalhe-produtos-c p-desejados";

        // Cria o elemento <article> com a classe 'proposta-detalhe-produto-single-product'
        const articleProduto = document.createElement("article");
        articleProduto.className = "proposta-detalhe-produto-single-product";

        // Cria o elemento <div> com a classe 'proposta-detalhe-produto-single-product-img-container'
        const divProdutoImgContainer = document.createElement("div");
        divProdutoImgContainer.className =
            "proposta-detalhe-produto-single-product-img-container";

        // Cria o elemento <img> com o atributo 'src' definido como './img/avatar1.png'
        const imgProduto = document.createElement("img");
        imgProduto.src = proposta_obj.requisitado.produtos[0].imagem.src;
        imgProduto.alt = "";
        imgProduto.className = "proposta-detalhe-produto-single-product-img";

        // Adiciona o elemento <img> dentro do elemento <div>
        divProdutoImgContainer.appendChild(imgProduto);

        // Cria o elemento <div> com a classe 'proposta-detalhe-produto-single-product-info-container'
        const divProdutoInfoContainer = document.createElement("div");
        divProdutoInfoContainer.className =
            "proposta-detalhe-produto-single-product-info-container";

        // Cria o elemento <p> com o texto 'Lorem, ipsum dolor.'
        const pLoremIpsum2 = document.createElement("p");
        pLoremIpsum2.textContent = proposta_obj.requisitado.produtos[0].nome;

        // Adiciona o elemento <p> dentro do elemento <div>
        divProdutoInfoContainer.appendChild(pLoremIpsum2);

        // Cria o elemento <span> com o texto 'Ver produto'

        const aVerProduto = document.createElement("a");
        aVerProduto.href = `http://localhost:5000/detalhe-produto.html?id=${proposta_obj.requisitado.produtos[0].id}`;
        aVerProduto.setAttribute("target", "_blank");

        const spanVerProduto = document.createElement("span");
        spanVerProduto.textContent = "Ver produto";

        aVerProduto.appendChild(spanVerProduto);
        // Adiciona o elemento <span> dentro do elemento <div>
        divProdutoInfoContainer.appendChild(aVerProduto);

        // Adiciona o elemento <div> dentro do elemento <article>
        articleProduto.appendChild(divProdutoImgContainer);
        articleProduto.appendChild(divProdutoInfoContainer);

        // Adiciona o elemento <article> dentro do elemento <div>
        divProdutosDesejados.appendChild(articleProduto);

        // Adiciona o elemento <div> dentro do elemento <div>
        divProduto.appendChild(divProdutosDesejados);

        // Adiciona o elemento <div> dentro do elemento <div>
        divContainer.appendChild(divProduto);

        // Cria o elemento <div> com a classe 'troca-img-container'
        const divTrocaImgContainer = document.createElement("div");
        divTrocaImgContainer.className = "troca-img-container";

        // Cria o elemento <img> com o atributo 'src' definido como './img/trocaTransparente.png'
        const imgTroca = document.createElement("img");
        imgTroca.src = "./img/trocaTransparente.png";
        imgTroca.alt = "";
        imgTroca.className = "troca-img";

        // Adiciona o elemento <img> dentro do elemento <div>
        divTrocaImgContainer.appendChild(imgTroca);

        // Adiciona o elemento <div> dentro do elemento <div>
        divContainer.appendChild(divTrocaImgContainer);

        // Cria o elemento <div> com a classe 'proposta-detalhe-produto'
        const divProduto2 = document.createElement("div");
        divProduto2.className = "proposta-detalhe-produto";

        // Cria o elemento <div> com a classe 'proposta-detalhe-usuario usuario2'
        const divUsuario2 = document.createElement("div");
        divUsuario2.className = "proposta-detalhe-usuario usuario2";

        // Cria o elemento <div> com a classe 'proposta-detalhe-usuario-img-container'
        const divUsuarioImgContainer2 = document.createElement("div");
        divUsuarioImgContainer2.className =
            "proposta-detalhe-usuario-img-container";

        // Cria o elemento <img> com o atributo 'src' definido como './img/avatar1.png'
        const imgAvatar2 = document.createElement("img");
        imgAvatar2.src = proposta_obj.requisitante.avatar;
        imgAvatar2.alt = "";

        // Adiciona o elemento <img> dentro do elemento <div>
        divUsuarioImgContainer2.appendChild(imgAvatar2);

        // Adiciona o elemento <div> dentro do elemento <div>
        divUsuario2.appendChild(divUsuarioImgContainer2);

        // Cria o elemento <p> com o texto 'Lorem, ipsum dolor.'
        const pLoremIpsum3 = document.createElement("p");
        pLoremIpsum3.textContent = proposta_obj.requisitante.nome;

        // Adiciona o elemento <p> dentro do elemento <div>
        divUsuario2.appendChild(pLoremIpsum3);

        // Adiciona o elemento <div> dentro do elemento <div>
        divProduto2.appendChild(divUsuario2);

        // Cria o elemento <div> com a classe 'proposta-detalhe-produtos-c p-oferecido'
        const divProdutosOferecidos = document.createElement("div");
        divProdutosOferecidos.className =
            "proposta-detalhe-produtos-c p-oferecido";

        for (let i = 0; i < proposta_obj.requisitante.produtos.length; i++) {
            let articleProdutoTemp = document.createElement("article");
            articleProdutoTemp.className =
                "proposta-detalhe-produto-single-product";

            // Cria o elemento <div> com a classe 'proposta-detalhe-produto-single-product-img-container'
            const divProdutoImgContainer = document.createElement("div");
            divProdutoImgContainer.className =
                "proposta-detalhe-produto-single-product-img-container";

            // Cria o elemento <img> com o atributo 'src' definido como './img/avatar1.png'
            const imgProduto = document.createElement("img");
            imgProduto.src = proposta_obj.requisitante.produtos[i].imagem.src;
            imgProduto.alt = "";
            imgProduto.className =
                "proposta-detalhe-produto-single-product-img";

            // Adiciona o elemento <img> dentro do elemento <div>
            divProdutoImgContainer.appendChild(imgProduto);

            // Cria o elemento <div> com a classe 'proposta-detalhe-produto-single-product-info-container'
            const divProdutoInfoContainer = document.createElement("div");
            divProdutoInfoContainer.className =
                "proposta-detalhe-produto-single-product-info-container";

            // Cria o elemento <p> com o texto 'Lorem, ipsum dolor.'
            const pLoremIpsum2 = document.createElement("p");
            pLoremIpsum2.textContent =
                proposta_obj.requisitante.produtos[i].nome;

            // Adiciona o elemento <p> dentro do elemento <div>
            divProdutoInfoContainer.appendChild(pLoremIpsum2);

            // Cria o elemento <span> com o texto 'Ver produto'

            const aVerProduto = document.createElement("a");
            aVerProduto.href = `http://localhost:5000/detalhe-produto.html?id=${proposta_obj.requisitante.produtos[i].id}`;
            aVerProduto.setAttribute("target", "_blank");

            const spanVerProduto = document.createElement("span");
            spanVerProduto.textContent = "Ver produto";

            aVerProduto.appendChild(spanVerProduto);
            // Adiciona o elemento <span> dentro do elemento <div>
            divProdutoInfoContainer.appendChild(aVerProduto);

            // Adiciona o elemento <div> dentro do elemento <article>
            articleProdutoTemp.appendChild(divProdutoImgContainer);
            articleProdutoTemp.appendChild(divProdutoInfoContainer);

            // Adiciona o elemento <article> dentro do elemento <div>
            divProdutosOferecidos.appendChild(articleProdutoTemp);
        }

        // Adiciona o elemento <div> dentro do elemento <div>
        divProduto2.appendChild(divProdutosOferecidos);

        // Adiciona o elemento <div> dentro do elemento <div>
        divContainer.appendChild(divProduto2);

        // Adiciona o elemento <div> dentro do elemento <div>
        divCenter.appendChild(divContainer);

        // Agora você pode adicionar o elemento <div> criado ao documento onde desejar.
        return divCenter;
    }
}

class Chat {
    constructor(proposta_id) {
        this.propostaId = proposta_id;
        this.messages = {};
        this.remetente = null;
        this.destinatario = null;
        this.messagesContainerHtml = null;
    }

    async openChat() {
        const chatContainer = document.querySelector(".chat-container");
        chatContainer.appendChild(this.criarChatNode());

        try {
            // requisição para o backend
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/data/chat/${this.propostaId}`
            );

            if (response.status !== 200) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { data } = await response.json();

            this.remetente = data.users.remetente;
            this.destinatario = data.users.destinatario;

            this.mensagens = data.messages;
            this.renderMessages(this.mensagens);
        } catch (error) {
            console.log(error);
        }

        chatContainer.classList.add("show-chat");
        console.log("abrindo chat");
    }

    renderMessages(obj_messages) {
        if (this._isEmpty(obj_messages)) {
            return;
        }

        for (const key in obj_messages) {
            const data = document.createElement("p");
            data.classList.add("chat-messages-data");
            data.textContent = key;
            this.messagesContainerHtml.appendChild(data);

            for (const obj of obj_messages[key]) {
                const div = document.createElement("div");
                div.classList.add("chat-single-message-container");
                div.classList.add(
                    obj["remetente"] == this.remetente
                        ? "right-side"
                        : "left-side"
                );

                const p = document.createElement("p");
                p.classList.add("chat-single-message");
                p.classList.add(
                    obj["remetente"] == this.remetente ? "right" : "left"
                );

                p.textContent = obj["mensagem"];
                div.appendChild(p);
                this.messagesContainerHtml.appendChild(div);
            }
        }

        this._chatScroll();
    }

    _chatScroll() {
        setTimeout(() => {
            this.messagesContainerHtml.scrollTop =
                this.messagesContainerHtml.scrollHeight;
        }, 0);
    }

    closeChat() {
        const chatContainer = document.querySelector(".chat-container");
        chatContainer.innerHTML = "";
        chatContainer.classList.remove("show-chat");

        console.log("fechando chat");
    }

    criarChatNode() {
        const chatDiv = document.createElement("div");
        chatDiv.className = "chat";

        const closeBtnContainer = document.createElement("div");
        closeBtnContainer.className = "chat-close-btn-container";

        const closeBtn = document.createElement("span");
        closeBtn.className = "chat-close-btn";

        closeBtn.addEventListener("click", this.closeChat);

        const closeIcon = document.createElement("i");
        closeIcon.className = "fas fa-times";
        closeBtn.appendChild(closeIcon);
        closeBtnContainer.appendChild(closeBtn);

        chatDiv.appendChild(closeBtnContainer);

        const messagesDiv = document.createElement("div");
        messagesDiv.className = "chat-messages";

        this.messagesContainerHtml = messagesDiv;

        chatDiv.appendChild(messagesDiv);

        const enviarContentContainer = document.createElement("div");
        enviarContentContainer.className = "chat-enviar-content-container";
        const form = document.createElement("form");
        form.action = "#";
        form.className = "chat-form";
        const textarea = document.createElement("textarea");
        textarea.className = "chat-input-value";
        form.appendChild(textarea);

        const enviarBtn = document.createElement("button");
        enviarBtn.className = "chat-enviar-btn";
        const enviarIcon = document.createElement("i");
        enviarIcon.className = "fa-regular fa-paper-plane";
        enviarBtn.appendChild(enviarIcon);

        this.enviar = this.enviar.bind(this);
        enviarBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.enviar();
        });
        form.appendChild(enviarBtn);

        enviarContentContainer.appendChild(form);
        chatDiv.appendChild(enviarContentContainer);

        return chatDiv;
    }

    _isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    async enviar() {
        const input = document.querySelector(".chat-input-value");

        if (input.value.length <= 0) {
            return;
        }

        const formData = {
            remetente: this.remetente,
            destinatario: this.destinatario,
            proposta: this.propostaId,
            mensagem: input.value,
        };

        const form = new FormData();

        for (const chave in formData) {
            form.append(chave, formData[chave]);
        }

        try {
            // enviando os dados adicionados no chat e renderizando novamente
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/data/chat/${this.propostaId}`,
                {
                    method: "POST",
                    body: form,
                }
            );

            if (response.status !== 201) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { data } = await response.json();

            this.mensagens = data.messages;
            this.renderMessages(this.mensagens);
        } catch (error) {
            console.log(error);
        }

        console.log("enviando mensagem");

        input.value = "";
    }
}
