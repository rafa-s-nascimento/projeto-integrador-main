const path = require("path");
const fs = require("fs");
const Usuario = require("../models/usuarioModel");
const Avatar = require("../models/avatarModels");

const avatars = async (req, res) => {
    const data = [];

    const pathName = path.join(__dirname, "../public", "img");

    fs.readdir(pathName, (err, files) => {
        if (err) {
            return res
                .status(400)
                .json({ msg: "erro ao recuperar imagens" + err, data: [] });
        } else {
            const avatars = files
                .filter((img) => img.startsWith("avatar"))
                .map((img, index) => ({ id: index, src: "./img/" + img }));

            return res.status(200).json({ msg: "success", data: avatars });
        }
    });
};

const basicInfo = async (req, res) => {
    const user = req.user;

    const userBasicInfo = await Usuario.findByPk(user.id, {
        attributes: ["nome"],
        include: [
            {
                attributes: ["img_path"],
                model: Avatar,
            },
        ],
    });

    if (!userBasicInfo) {
        return res
            .status(400)
            .json({ msg: "Não foi possível encontrar o usuario" });
    }

    console.log(userBasicInfo.nome);
    console.log(userBasicInfo.avatar.img_path);

    return res
        .status(200)
        .json({
            msg: "success",
            data: {
                nome: userBasicInfo.nome,
                img: userBasicInfo.avatar.img_path,
            },
        });
};

module.exports = { avatars, basicInfo };
