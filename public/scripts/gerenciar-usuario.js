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

        this.criarNode();
    }

    criarNode() {
        const div = document.createElement("div");
        div.classList.add("usuario-content-center");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("usuario-avatar-img-container");

        const avatarImg = document.createElement("img");
        avatarImg.classList.add("usuario-avatar-img", "img");
        avatarImg.src = this.avatar;
        avatarImg.alt = "";

        const avatarAlterarSpan = document.createElement("span");
        avatarAlterarSpan.classList.add("usuario-avatar-img-alterar");

        const avatarAlterarIcon = document.createElement("i");
        avatarAlterarIcon.classList.add("fa-solid", "fa-square-pen");

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
