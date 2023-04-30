const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");

const {
    gerenciar,
    gerenciarPage,
    gerenciarInfoData,
} = require("../controllers/gerenciarControllers");

// rota protegida
router.get("/", gerenciar);
router.get("/minha-conta", [authenticationMiddleware, gerenciarPage]);
router.get("/minha-conta/data", [authenticationMiddleware, gerenciarInfoData]);

module.exports = router;
