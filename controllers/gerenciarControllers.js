const path = require("path");

// após a autenticação, esse controler será reponsável por enviar todos os dados do usuario
// produtos cadastrados, propostas feitas, propostas recebidas.

const gerenciar = (req, res) => {
    res.status(200).redirect("/minha-conta");
};

const gerenciarPage = (req, res) => {
    const pathFile = path.join(__dirname, "../private/gerenciar.html");
    res.status(302).sendFile(pathFile);
};

const gerenciarInfoData = (req, res) => {
    // esse middleware pegara informações de usuario como produtos e propostas

    res.status(200).json({
        data: {
            user: {
                nome: "joaozinho",
                avatar: "img/avatar2.png",
                email: "email@email.com",
            },
            produto: [
                {
                    nome: "o segredo",
                    id: 1234,
                    intencao: "trocar",
                    img: "./uploads/1681647756791.jpg",
                    visivel: true,
                    disponivel: true,
                },
            ],
            propostas: {
                recebidas: [],
                efetuadas: [],
            },
        },
    });
};

module.exports = { gerenciar, gerenciarPage, gerenciarInfoData };
