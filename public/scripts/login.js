import { ajustes } from "./comum.js";

const { testLogin, testSenha1 } = ajustes;

const login = document.querySelector(".login-login");
const password = document.querySelector(".login-password");
const form = document.querySelector("form");

login.addEventListener("blur", () => {
    testLogin(login);
});
password.addEventListener("input", () => {
    testSenha1(password);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (testLogin(login) && testSenha1(password)) {
        const data = { email: login.value, password: password.value };

        const logar = async () => {
            const setData = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((res) => {
                    if (res.status == 200) {
                        return res.json();
                    }
                })
                .then(({ token, user_data }) => {
                    sessionStorage.setItem("token", token);
                    sessionStorage.setItem(
                        "user_data",
                        JSON.stringify(user_data)
                    );

                    window.location.href = "/";
                })
                .catch(() => {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user_data");
                });
        };

        logar();
    }

    // fetch(
    //     `http://localhost:3000/login?email=${login.value}&senha=${password.value}`
    // )
    //     .then((response) => {
    //         return response.json();
    //     })
    //     .catch((err) => {
    //         console.log("this is the catch " + err);
    //     })
    //     .then((response) => {
    //         if (response.length > 0) {
    //             window.location.href = "./admin-produtos.html";
    //         } else {
    //             console.log("Usuário ou senha invalidos");
    //         }
    //     });
});
