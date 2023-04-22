// essa rota precisa ser protegida, é necessário passar o middle de auth antes
const getInfoProposta = async (req, res) => {
    const params = req.params;

    const interessado = req.user;

    const produto_alvo = "req"; //requisição para o bd para procura pelo produto e o dono

    res.status(200).json({
        proprietario: {
            user: {
                id: 12,
                nome: "jhon doe",
                avatar: "./img/avatar4.png",
            },
            produto: [
                {
                    id: 1234,
                    nome: "fita original vhs",
                    img: ["./uploads/1681647511841.jpg"],
                },
            ],
        },
        interessado: {
            user: {
                id: 39,
                nome: "bob o contrutor",
                avatar: "./img/avatar1.png",
            },
            produto: [
                {
                    id: 1245,
                    nome: "fita original vhs",
                    img: ["./uploads/1681647511841.jpg"],
                },
                {
                    id: 1246,
                    nome: "fita original vhs",
                    img: ["./uploads/9939ddd1f6b07073b62745d7962e2d4b.jpg"],
                },
            ],
        },
    });
};

// essa rota precisa ser protegida, é necessário passar o middle de auth antes
const setInfoProposta = async (req, res) => {
    const params = req.params;
    const url = req.url;
    console.log(params);
    console.log(url);
    res.status(201).json({
        msg: "os dados foram enviados para o servidor",
        success: true,
    });
};

module.exports = {
    getInfoProposta,
    setInfoProposta,
};
