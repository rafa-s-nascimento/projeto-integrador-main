const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");

const {
    gerenciar,
    gerenciarPage,
    gerenciarInfoData,
    gerenciarAlterar,
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

// rota protegida

router.put(
    "/minha-conta/alterar",

    [checarFile, authenticationMiddleware, uploadImage, gerenciarAlterar]
);

router.get("/", gerenciar);
router.get("/minha-conta", [authenticationMiddleware, gerenciarPage]);
router.get("/minha-conta/data", [authenticationMiddleware, gerenciarInfoData]);

module.exports = router;
