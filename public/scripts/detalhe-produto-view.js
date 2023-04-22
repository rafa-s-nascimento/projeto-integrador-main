const urlSearch = window.location.search;

const containerImgs = document.querySelector(".container-img-miniatura");
const slider = document.querySelector(".slider");
const $nome = document.querySelector(".single-product-name");
const $descricao = document.querySelector(".single-product-descricao");
const $intencao = document.querySelector(".single-product-troca-ou-doacao");
const $tipo = document.querySelector(".single-product-tipo");
const $categoria = document.querySelector(".single-product-categoria");
const $condicao = document.querySelector(".single-product-condicao");

window.addEventListener("DOMContentLoaded", async () => {
    const id = urlSearch.replace("?id=", "");

    try {
        const response = await fetch(`http://localhost:5000/products/${id}`);

        if (!response.status == 200) {
            throw new Error("falha ao requisitar produto");
        }
        const { data } = await response.json();

        if (!data) {
            throw new Error("not found");
        }

        const { nome, intencao, categoria, tipo, condicao, descricao } = data;
        const { img } = data;

        console.log(nome);
        $nome.textContent = nome;
        $descricao.textContent = descricao;
        $intencao.textContent = intencao;
        $tipo.textContent = tipo;
        $condicao.textContent = condicao;

        containerImgs.innerHTML = img
            .map(({ src }, id) => {
                return `<div class="img-miniatura-container" data-id="${id}">
                <img class="img img-miniatura"
                    src="${src}"
                    alt=""
                    draggable="false"
                />
            </div>`;
            })
            .reverse()
            .join("");

        slider.innerHTML = img
            .map(({ src }) => {
                return `<img
                                class="img img-principal"
                                src=${src}
                                alt=""
                            />`;
            })
            .join("");

        const mainImgs = [
            ...document.querySelectorAll(".img-principal"),
        ].reverse();

        const prev = document.querySelector(".prev");
        const next = document.querySelector(".next");

        mainImgs.forEach((img, index) => {
            img.style.left = `${index * 100}%`;
        });

        let count = 0;

        next.addEventListener("click", () => {
            count++;
            carousel();
        });
        prev.addEventListener("click", () => {
            count--;
            carousel();
        });

        const carousel = () => {
            if (count == mainImgs.length) {
                count = 0;
            }
            if (count < 0) {
                count = mainImgs.length - 1;
            }

            console.log(count);

            mainImgs.forEach((img) => {
                img.style.transform = `translateX(-${count * 100}%)`;
            });
        };
    } catch (error) {
        const main = (document.querySelector(
            ".produtos-container"
        ).innerHTML = `<h2>${error}</h2>`);

        console.log(error);
    }
});

// containerImgs.addEventListener("mousedown", (e) => {
//     posicaoInicio = e.screenY;

//     const firstImg = containerImg[0];
//     const lastImg = containerImg[containerImg.length - 1];

//     const maxTop = containerImgs.getBoundingClientRect().top;
//     const maxbottom = containerImgs.getBoundingClientRect().bottom;

//     let lastImgbottom = lastImg.getBoundingClientRect().bottom;

//     if (lastImgbottom < maxbottom) {
//         return;
//     }

//     const dif = maxbottom - lastImgbottom;

//     const moveImage = (e) => {
//         if (posicaoInicio !== null) {
//             posicaoFinal = e.screenY;
//             diferenca = posicaoFinal - posicaoInicio;

//             containerImg.forEach((element) => {
//                 element.style.transform = `translateY(${diferenca}px)`;
//             });
//         }
//     };

//     window.addEventListener("mousemove", moveImage);

//     window.addEventListener("mouseup", (e) => {
//         window.removeEventListener("mousemove", moveImage);

//         let firstImgTop = firstImg.getBoundingClientRect().top;
//         let lastImgbottom = lastImg.getBoundingClientRect().bottom;

//         console.log(maxTop);
//         if (firstImgTop > maxTop) {
//             containerImg.forEach((element) => {
//                 element.style.transform = `translateY(${0}px)`;
//             });
//         } else if (lastImgbottom < maxbottom) {
//             containerImg.forEach((element) => {
//                 element.style.transform = `translateY(${dif}px)`;
//             });
//         } else {
//             return;
//         }

//         posicaoInicio = null;
//         posicaoFinal = null;
//         diferenca = null;

//         // posicaoInicio = null;
//         // posicaoFinal = null;
//         // containerImgs.removeEventListener("mousemove", moveImage);
//     });
// });
