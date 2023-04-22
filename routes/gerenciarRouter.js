const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");

const {
    gerenciar,
    gerenciarPage,
} = require("../controllers/gerenciarControllers");

// rota protegida
router.get("/", gerenciar);
router.get("/minha-conta", [authenticationMiddleware, gerenciarPage]);

module.exports = router;
