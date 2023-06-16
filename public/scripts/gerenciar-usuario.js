import { ajustes } from "./comum.js";

export const gerenciarUsuario = (data) => {
    const usuarioContainer = document.querySelector(".usuario-content");
    const usuario = new Usuario(usuarioContainer, data);
};

class Usuario {
    constructor(node, data) {
        this.parentElement = node;
        this.id = data.id;
        this.nome = data.nome;
        this.email = data.email;
        this.avatar = data.avatar;
        this.gerenciarAvatars = null;

        this.criarNode();
    }

    modificarAvatar() {
        console.log("abrindo o modificar avatar");

        if (!this.gerenciarAvatars) {
            this.gerenciarAvatars = new Avatar(
                this.avatar,
                this.parentElement,
                this
            );
        }
    }

    criarNode() {
        const div = document.createElement("div");
        div.classList.add("usuario-content-center");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("usuario-avatar-img-container");

        // passar esse como avatar node
        const avatarImg = document.createElement("img");
        avatarImg.classList.add("usuario-avatar-img", "img");
        avatarImg.src = this.avatar;
        avatarImg.alt = "";

        const avatarAlterarSpan = document.createElement("span");
        avatarAlterarSpan.classList.add("usuario-avatar-img-alterar");

        const avatarAlterarIcon = document.createElement("i");
        avatarAlterarIcon.classList.add("fa-solid", "fa-square-pen");

        this.modificarAvatar = this.modificarAvatar.bind(this);
        avatarAlterarSpan.addEventListener("click", () => {
            this.modificarAvatar();
        });

        avatarAlterarSpan.appendChild(avatarAlterarIcon);

        avatarDiv.appendChild(avatarImg);
        avatarDiv.appendChild(avatarAlterarSpan);

        const nomeH4 = document.createElement("h4");
        nomeH4.classList.add("usuario-nome");

        const usuarioIcon = document.createElement("i");
        usuarioIcon.classList.add("fa-solid", "fa-user");

        const spanNome = document.createElement("span");
        spanNome.classList.add("usuario-nome-span");

        const nomeText = document.createTextNode(this.nome);

        spanNome.appendChild(nomeText);

        const nomeAlterarSpan = document.createElement("span");
        nomeAlterarSpan.classList.add("usuario-nome-alterar");

        const nomeAlterarIcon = document.createElement("i");
        nomeAlterarIcon.classList.add("fa-solid", "fa-pen");

        nomeAlterarSpan.appendChild(nomeAlterarIcon);

        nomeH4.appendChild(usuarioIcon);
        nomeH4.appendChild(spanNome);
        nomeH4.appendChild(nomeAlterarSpan);

        const senhaH4 = document.createElement("h4");

        const senhaIcon = document.createElement("i");
        senhaIcon.classList.add("fa-solid", "fa-key");

        const spanPass = document.createElement("span");
        spanPass.classList.add("usuario-password-span");

        const senhaText = document.createTextNode("********");

        spanPass.appendChild(senhaText);

        const senhaAlterarSpan = document.createElement("span");
        senhaAlterarSpan.classList.add("usuario-password-alterar");

        const senhaAlterarIcon = document.createElement("i");
        senhaAlterarIcon.classList.add("fa-solid", "fa-pen");

        senhaAlterarSpan.appendChild(senhaAlterarIcon);

        senhaH4.appendChild(senhaIcon);
        senhaH4.appendChild(spanPass);
        senhaH4.appendChild(senhaAlterarSpan);

        const emailH4 = document.createElement("h4");
        emailH4.classList.add("usuario-email");

        const emailIcon = document.createElement("i");
        emailIcon.classList.add("fa-solid", "fa-envelope");

        const spanEmail = document.createElement("span");
        spanEmail.classList.add("usuario-email-span");

        const emailText = document.createTextNode(this.email);

        spanEmail.appendChild(emailText);

        emailH4.appendChild(emailIcon);
        emailH4.appendChild(spanEmail);

        div.appendChild(avatarDiv);
        div.appendChild(nomeH4);
        div.appendChild(senhaH4);
        div.appendChild(emailH4);

        this.parentElement.appendChild(div);
    }
}

class Avatar {
    constructor(avatar_src, parentElementHtml, parentElementObj) {
        this.avatar_src = avatar_src;
        this.new_avatar_src = avatar_src;
        this.parentElementHtml = parentElementHtml;
        this.parentElementObj = parentElementObj;
        this.imgNodes = [];
        this.avatars = [];

        this.fetchData();
    }

    async fetchData() {
        try {
            // requisição para o backend
            const response = await fetch(`http://localhost:5000/avatars`);

            if (response.status !== 200) {
                const { msg } = await response.json();

                throw new Error(msg);
            }

            const { data } = await response.json();

            this.avatars = data;

            this.criarNode(this.avatars);
        } catch (error) {
            console.log(error);
        }
    }

    setAvatar(element) {
        const mainAvatar = document.querySelector(".usuario-avatar-img");

        this.imgNodes.forEach((node) => node.classList.remove("selected"));
        element.classList.add("selected");

        this.new_avatar_src = element.firstElementChild.src;

        mainAvatar.src = this.new_avatar_src;
    }

    retornar() {
        const mainAvatar = document.querySelector(".usuario-avatar-img");
        mainAvatar.src = this.avatar_src;

        this.fechar();
    }

    fechar() {
        this.parentElementHtml.lastElementChild.remove();
        this.parentElementObj.gerenciarAvatars = null;
    }

    async salvar() {
        const url = new URL(this.new_avatar_src);
        const src = url.pathname;

        const form = new FormData();
        form.append("src", "." + src);

        if (this.avatar_src === "." + src) {
            this.fechar();
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/gerenciar/minha-conta/update-avatar`,
                {
                    method: "PUT",
                    body: form,
                }
            );

            if (response.status !== 201) {
                const { msg } = response.json();

                throw new Error(msg);
            }

            this.fechar();
        } catch (error) {
            console.log(error);
        }
    }

    criarNode(avatars) {
        const div = document.createElement("div");
        div.classList.add("usuario-avatars-container", "open");

        const div1 = document.createElement("div");
        div1.classList.add("usuario-avatars-content");

        for (const img of avatars) {
            const div3 = document.createElement("div");
            div3.classList.add("usuario-avatar-single-img-container");

            const nodeImg = document.createElement("img");
            nodeImg.src = img.src;
            nodeImg.alt = "avatar";

            div3.setAttribute("data-id", img.id);
            div3.appendChild(nodeImg);

            this.setAvatar = this.setAvatar.bind(this);
            div3.addEventListener("click", (e) => {
                this.setAvatar(e.currentTarget);
            });

            this.imgNodes.push(div3);

            if (this.avatar_src === img.src) {
                div3.classList.add("selected");
            }

            div1.appendChild(div3);
        }

        div.appendChild(div1);

        const div2 = document.createElement("div");
        div2.classList.add("usuario-avatars-btn-container");

        const span1 = document.createElement("span");
        span1.classList.add("usuario-avatars-btn", "salvar", "bg-green");
        span1.textContent = "salvar";

        span1.addEventListener("click", () => {
            this.salvar();
        });

        const span2 = document.createElement("span");
        span2.classList.add("usuario-avatars-btn", "retornar", "bg-red");
        span2.textContent = "retornar";

        span2.addEventListener("click", () => {
            this.retornar();
        });

        div2.appendChild(span1);
        div2.appendChild(span2);

        div.appendChild(div2);

        this.parentElementHtml.appendChild(div);
    }
}
