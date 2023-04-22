const express = require("express");
const router = express.Router();
const { login, logar } = require("../controllers/authControllers");

router.get("/", login);
router.post("/", logar);

module.exports = router;
