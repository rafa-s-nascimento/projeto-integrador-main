const express = require("express");
const router = express.Router();
const { cadastro, cadastrar } = require("../controllers/authControllers");

router.get("/", cadastro);
router.post("/", cadastrar);

module.exports = router;
