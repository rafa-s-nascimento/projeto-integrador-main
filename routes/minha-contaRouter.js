const express = require("express");
const router = express.Router();

const { authenticationMiddleware } = require("../middleware/auth");
const { gerenciarPage } = require("../controllers/gerenciarControllers");
const { basicInfo } = require("../controllers/avatarsController");

router.get("/", [authenticationMiddleware, gerenciarPage]);

router.get("/usuario-info", [authenticationMiddleware, basicInfo]);

module.exports = router;
