const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");
const { gerenciarPage } = require("../controllers/gerenciarControllers");

router.get("/", [authenticationMiddleware, gerenciarPage]);

module.exports = router;
