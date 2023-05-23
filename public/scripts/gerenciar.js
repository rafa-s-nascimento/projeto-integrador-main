import { gerenciarProdutos } from "./gerenciar-produto.js";
import { tratarProposta } from "./gerenciar-proposta.js";
import { ajustes } from "./comum.js";

const logoutBtn = document.querySelector(".logout-btn");

window.addEventListener("DOMContentLoaded", async function () {
    ajustes.setLoading();
    try {
        const response = await fetch(
            `http://localhost:5000/gerenciar/minha-conta/data`
        );

        if (response.status === 200) {
            const { data } = await response.json();

            const { user, produto, propostas } = data;

            const { recebidas, efetuadas } = propostas;

            sessionStorage.setItem("produtos", JSON.stringify(produto));

            gerenciarProdutos();

            tratarProposta(recebidas, "recebidas");
            tratarProposta(efetuadas, "efetuadas");
        }
    } catch (error) {
        console.log(error);
    }

    ajustes.removeLoading();

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
            "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        sessionStorage.removeItem("user_data");
        window.location = "/login";
    });
});
