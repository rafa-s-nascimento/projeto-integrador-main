const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authenticationMiddleware = async (req, res, next) => {
    if (!req.headers) {
        return res.status(401).redirect("/login");
    }

    const authHeader = req.cookies.token;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).redirect("/login");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, nome } = decoded;

        req.user = { id, nome };
        next();
    } catch (error) {
        throw new UnauthenticatedError(
            "Not authorized to access this route",
            401
        );
    }
};

module.exports = { authenticationMiddleware };
