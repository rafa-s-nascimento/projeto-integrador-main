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

const gerenciarInfo = (req, res) => {
    // esse middleware pegara informações de usuario como produtos e propostas

    res.status(200).json({ data: "info" });
};

module.exports = { gerenciar, gerenciarPage, gerenciarInfo };
