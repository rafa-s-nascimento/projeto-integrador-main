const logoutBtn = document.querySelector(".logout-btn");
const cadastrarBtn = document.querySelector(".cadastrar-produto-anc");

window.addEventListener("DOMContentLoaded", function () {
    console.log(this.document.cookie);

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
