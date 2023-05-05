const path = require("path");
const { Op, where } = require("sequelize");

const ImagensProduto = require("../models/imagensProdutoModels");
const ProductModel = require("../models/productModel");
const ValoresInput = require("../models/valoresInputModels");
const PropostaDeTroca = require("../models/propostaModel");
const UsuarioModel = require("../models/usuarioModel");
const PropostaProdutos = require("../models/propostaProdutosModel");
const Avatar = require("../models/avatarModels");

// corrigir essa função.
// talvez guardar os atributos que venham após o primeiro no rest operator e
// ir verificando qual não é undefined seja uma solução
const filtrarColection = (arr_colection, atr1, atr2) => {
    if (atr1) {
        return arr_colection.map((objeto) => {
            const filterAtr1 = objeto[atr1].map((obj) => obj.dataValues);

            let filterAtr2 = null;
            const objTemp = { ...objeto.dataValues };

            if (atr2) {
                filterAtr2 = objeto[atr2].dataValues.valor;

                objTemp[atr2] = filterAtr2;
            }

            objTemp[atr1] = filterAtr1;

            return objTemp;
        });
    }

    return arr_colection.map((objeto) => objeto.dataValues);
};

const tratarProposta = (arr_propostas_recebidas, arr_propostas_efetuadas) => {
    const id_protudo_requisitado = new Set();
    const id_protudo_que_desejo = new Set();

    arr_propostas_recebidas.filter((proposta) => {
        id_protudo_requisitado.add(
            proposta["proposta_produtos"][0]["id_produto_requisitado"]
        );
    });

    arr_propostas_efetuadas.filter((proposta) => {
        id_protudo_que_desejo.add(
            proposta["proposta_produtos"][0]["id_produto_requisitado"]
        );
    });

    const associarPropostasRecebidas = [...id_protudo_requisitado].map((id) => {
        return {
            id: id,
            propostas: arr_propostas_recebidas.filter((proposta) => {
                return (
                    proposta.proposta_produtos[0]["id_produto_requisitado"] ===
                    id
                );
            }),
        };
    });

    const associarPropostasEfetuadas = [...id_protudo_que_desejo].map((id) => {
        return {
            id: id,
            propostas: arr_propostas_efetuadas.filter((proposta) => {
                return (
                    proposta.proposta_produtos[0]["id_produto_requisitado"] ===
                    id
                );
            }),
        };
    });

    const result = {
        recebidas: associarPropostasRecebidas,
        efetuadas: associarPropostasEfetuadas,
    };

    return result;
};

const selectInputID = (arr, atributo, valor) => {
    console.log(valor);
    return arr.find((obj) => obj[atributo] == valor)["id"];
};

const gerenciar = (req, res) => {
    res.status(200).redirect("/minha-conta");
};

const gerenciarPage = (req, res) => {
    const pathFile = path.join(__dirname, "../private/gerenciar.html");
    res.status(302).sendFile(pathFile);
};

const gerenciarInfoData = async (req, res) => {
    // esse middleware pegara informações de usuario como produtos e propostas

    const { id } = req.user;

    const userInfo = await UsuarioModel.findByPk(id, {
        include: [
            {
                model: Avatar,
            },
            {
                attributes: ["id", "nome", "visivel", "disponivel"],
                model: ProductModel,
                include: [
                    {
                        attributes: ["img_path", "id"],
                        model: ImagensProduto,
                        as: "produtoImg",
                    },
                    {
                        attributes: ["valor"],
                        model: ValoresInput,
                        as: "intencaoId",
                    },
                ],
                where: { excluido: 0 },
            },
            {
                attributes: ["id", "data_proposta", "proposta_ativa"],
                model: PropostaDeTroca,
                as: "propostaEfetuadaID",
                include: [
                    {
                        attributes: [
                            "id_produto_requisitado",
                            "id_produto_oferecido",
                        ],
                        model: PropostaProdutos,
                    },
                ],
            },
            {
                attributes: ["id", "data_proposta", "proposta_ativa"],
                model: PropostaDeTroca,
                as: "propostaRecebidaID",
                include: [{ model: PropostaProdutos }],
            },
        ],
        where: { id: id },
    });

    let user_id = userInfo.dataValues.id;
    let user_name = userInfo.dataValues.nome;
    let user_email = userInfo.dataValues.email;
    let avatar = userInfo.dataValues.avatar;

    const user = {
        id: user_id,
        nome: user_name,
        email: user_email,
        avatar: avatar.img_path,
    };

    const produtoInfo = filtrarColection(
        userInfo.produtos,
        "produtoImg",
        "intencaoId"
    );
    const propostasRecebidasInfo = filtrarColection(
        userInfo.propostaRecebidaID,
        "proposta_produtos"
    );
    const propostasEfetuadasInfo = filtrarColection(
        userInfo.propostaEfetuadaID,
        "proposta_produtos"
    );

    const propostasTratadas = tratarProposta(
        propostasRecebidasInfo,
        propostasEfetuadasInfo
    );

    res.status(200).json({
        data: {
            user: user,
            produto: produtoInfo,
            propostas: propostasTratadas,
        },
    });
};

const gerenciarAlterar = async (req, res) => {
    console.log("chegando ao alterar!");

    const updateValues = {};

    if (req.body.imgExcluidas) {
        const imagensExcluidas = JSON.parse(req.body.imgExcluidas);
        const imgId = imagensExcluidas.map((obj_img) => obj_img.id);

        await ImagensProduto.destroy({
            where: {
                id: {
                    [Op.or]: imgId,
                },
            },
        });
    }

    const keys = Object.keys(req.body);

    let valoresInput = null;

    const notInputValue = [
        "id",
        "nome",
        "descricao",
        "img",
        "visivel",
        "imgExcluida",
    ];

    const testarChave = keys.every((chave) => notInputValue.includes(chave));

    console.log(Number(req.body.id));

    if (!testarChave) {
        valoresInput = await ValoresInput.findAll({ raw: true });
    }

    for (const chave in req.body) {
        if (chave === "id" || chave === "imgExcluidas" || chave === "img") {
            continue;
        } else if (chave === "visivel") {
            updateValues[chave] = req.body[chave] == "true" ? 1 : 0;
            continue;
        } else if (chave === "nome" || chave === "descricao") {
            updateValues[chave] = req.body[chave];
            continue;
        } else {
            updateValues[`${chave}_id`] = selectInputID(
                valoresInput,
                "valor",
                req.body[chave]
            );
        }
    }

    console.log(updateValues);

    const update = await ProductModel.update(updateValues, {
        where: { id: Number(req.body.id) },
    });

    console.log(update);

    if (!req.noFile) {
        for (let i = 0; i < req.imagePath.length; i++) {
            await ImagensProduto.create({
                produto_id: Number(req.body.id),
                img_path: req.imagePath[i],
            });
        }
    }

    res.status(201).json({
        seccess: true,
        msg: "alteração realizada com sucesso!",
    });
};

const gerenciarExcluir = async (req, res) => {
    const { id } = req.params;

    const updateValues = {
        disponivel: 0,
        excluido: 1,
    };

    const update = await ProductModel.update(updateValues, {
        where: { id: Number(id) },
    });

    console.log(update);

    res.status(201).json({
        seccess: true,
        msg: "exclusao realizada com sucesso!",
    });
};

module.exports = {
    gerenciar,
    gerenciarPage,
    gerenciarInfoData,
    gerenciarAlterar,
    gerenciarExcluir,
};
