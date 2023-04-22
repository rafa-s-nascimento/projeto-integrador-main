const path = require("path");

const { StatusCodes } = require("http-status-codes");

const isArray = (obj) => {
    return obj[0] !== undefined ? true : false;
};

const isImage = (obj) => {
    return obj["mimetype"].startsWith("image");
};
const sizeCheck = (obj) => {
    return obj["size"] < 50000000;
};

const uploadImage = async (req, res, next) => {
    if (!req.files) {
        return res.status(StatusCodes.BAD_REQUEST).send("No file Uploaded");
    }

    const extensao = /\.\w+$/;
    let productImg = req.files.img;

    const isArr = isArray(productImg);

    if (isArr) {
        for (let i = 0; i < productImg.length; i++) {
            if (!isImage(productImg[i])) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .send("Please Upload Image");
            }

            if (!sizeCheck(productImg[i])) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .send("Please upload image smaller 5mb");
            }
        }
    } else {
        if (!productImg.mimetype.startsWith("image")) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Please Upload Image");
        }

        if (productImg.size > 5000000) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Please upload image smaller 5mb");
        }
    }

    req.imagePath = [];

    if (isArr) {
        for (let i = 0; i < productImg.length; i++) {
            productImg[i].name =
                new Date().getTime() + extensao.exec(productImg[i].name)[0];

            const imagePath = path.join(
                __dirname,
                "../public/uploads/" + `${productImg[i].name}`
            );

            await productImg[i].mv(imagePath);

            req.imagePath.push(`/uploads/${productImg[i].name}`);
        }
    } else {
        productImg.name =
            new Date().getTime() + extensao.exec(productImg.name)[0];

        const imagePath = path.join(
            __dirname,
            "../public/uploads/" + `${productImg.name}`
        );

        await productImg.mv(imagePath);

        req.imagePath.push(`/uploads/${productImg.name}`);
    }

    next();
};

module.exports = { uploadImage };
