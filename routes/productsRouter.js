const express = require("express");
const router = express.Router();

const {
    getProducts,
    getSingleProduct,
} = require("../controllers/productsControllers");

const {
    getInfoProposta,
    setInfoProposta,
} = require("../controllers/proposalControllers");

const { authenticationMiddleware } = require("../middleware/auth");

router.get("/:id", getSingleProduct);
router.get("/", getProducts);

// rotas protegidas
router.get("/proposta/:productID", authenticationMiddleware, getInfoProposta);
router.post("/proposta/:productID", authenticationMiddleware, setInfoProposta);

module.exports = router;
