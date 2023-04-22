const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadsControllers");

const {
    setProduct,
    getAddProductPage,
} = require("../controllers/productsControllers");

// rota protegida retorna a página de cadastrar produto
router.get("/", [authenticationMiddleware, getAddProductPage]);

// envia a solicitação para cadastrar um produto
router.post("/", [uploadImage, authenticationMiddleware, setProduct]);

module.exports = router;
