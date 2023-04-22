import { ajustes } from "./comum.js";

const { testNome, testLogin, testSenha1, testSenha2, exibirInfoUsuario } =
    ajustes;

const nome = document.querySelector(".cadastro-nome");
const login = document.querySelector(".cadastro-email");
const password = document.querySelector(".senha1");
const password2 = document.querySelector(".senha2");
const form = document.querySelector("form");

nome.addEventListener("blur", () => {
    testNome(nome);
});
login.addEventListener("blur", () => {
    testLogin(login);
});
password.addEventListener("blur", () => {
    testSenha1(password);
});
password2.addEventListener("input", () => {
    testSenha2(password2, password);
});

exibirInfoUsuario();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (
        testNome(nome) &&
        testLogin(login) &&
        testSenha1(password) &&
        testSenha2(password2, password)
    ) {
        const data = {
            nome: nome.value,
            email: login.value,
            password: password.value,
        };

        const confirmarCadastro = async () => {
            const setData = await fetch("http://localhost:5000/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }).then((res) => {
                if (res.status == 201) {
                    window.location.href = "./login";
                }
            });
        };

        confirmarCadastro();
    }
});
