const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");

const {
    gerenciar,
    gerenciarPage,
    gerenciarInfoData,
    gerenciarProdutoAlterar,
    gerenciarProdutoExcluir,
    gerenciarPropostaRecusar,
    gerenciarPropostaCancelar,
    gerenciarPropostaAceitar,
} = require("../controllers/gerenciarControllers");

const { uploadImage } = require("../controllers/uploadsControllers");

const checarFile = (req, res, next) => {
    console.log(req.files);

    let noFile = true;

    if (req.files) {
        noFile = false;
    }

    req["noFile"] = noFile;

    console.log(req.noFile);

    next();
};

router.put(
    "/minha-conta/alterar",

    [checarFile, authenticationMiddleware, uploadImage, gerenciarProdutoAlterar]
);
router.delete(
    "/minha-conta/alterar/excluir/:id",

    [authenticationMiddleware, gerenciarProdutoExcluir]
);

router.put(
    "/minha-conta/recusar/:id",

    [authenticationMiddleware, gerenciarPropostaRecusar]
);
router.put(
    "/minha-conta/cancelar/:id",

    [authenticationMiddleware, gerenciarPropostaCancelar]
);
router.put(
    "/minha-conta/aceitar/:id",

    [authenticationMiddleware, gerenciarPropostaAceitar]
);

router.get("/minha-conta/data", [authenticationMiddleware, gerenciarInfoData]);

module.exports = router;
