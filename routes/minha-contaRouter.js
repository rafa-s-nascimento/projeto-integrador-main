const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");
const { gerenciarPage } = require("../controllers/gerenciarControllers");
const { gerenciarInfo } = require("../controllers/gerenciarControllers");

router.get("/", [authenticationMiddleware, gerenciarPage]);
router.get("/info", [authenticationMiddleware, gerenciarInfo]);

module.exports = router;
