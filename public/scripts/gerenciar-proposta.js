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

        if (this.status == "aceita") {
            this.parentElementObj.setpropostaEmNegociacao(this.id, this.tipo);
        }
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

        // adicionar a classw show no chat
        // mandar requisição com o número da proposta,
        // verificar o id de quem ta enviando
        // retornar esse id
        // todas as mensagens com o usuarioId ficarão a direita.
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
