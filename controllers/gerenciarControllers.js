const path = require("path");
const { Op, where } = require("sequelize");

const ImagensProduto = require("../models/imagensProdutoModels");
const ProductModel = require("../models/productModel");
const ValoresInput = require("../models/valoresInputModels");
const PropostaDeTroca = require("../models/propostaModel");
const UsuarioModel = require("../models/usuarioModel");
const PropostaProdutos = require("../models/propostaProdutosModel");
const Avatar = require("../models/avatarModels");
const PropostaChat = require("../models/propostaChatModel");

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

const tratarMensagens = (arr_colection) => {
    const diasAgrupados = arr_colection.reduce((acc, curr) => {
        const day = curr.data_hora_mensagem.getDate();
        let month = curr.data_hora_mensagem.getMonth() + 1;
        const year = curr.data_hora_mensagem.getFullYear();

        if (month < 10) {
            month = "0" + month;
        }

        let data = `${day}-${month}-${year}`;

        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);

        if (
            hoje.getDate() === day &&
            hoje.getMonth() === curr.data_hora_mensagem.getMonth() &&
            hoje.getFullYear() === year
        ) {
            data = "hoje";
        }
        if (
            ontem.getDate() === day &&
            ontem.getMonth() === curr.data_hora_mensagem.getMonth() &&
            ontem.getFullYear() === year
        ) {
            data = "ontem";
        }

        if (!acc[data]) {
            acc[data] = [];
        }

        const hours = curr.data_hora_mensagem.getHours();
        const minutes = curr.data_hora_mensagem.getMinutes();

        acc[data].push({
            remetente: curr.id_remetente,
            mensagem: curr.mensagem,

            data: data,
            hora: `${hours}:${minutes}`,
        });

        return acc;
    }, {});

    return diasAgrupados;
};

const selectInputID = (arr, atributo, valor) => {
    console.log(valor);
    return arr.find((obj) => obj[atributo] == valor)["id"];
};

const gerenciar = (req, res) => {
    return res.status(200).redirect("/minha-conta");
};

const gerenciarPage = (req, res) => {
    const pathFile = path.join(__dirname, "../private/gerenciar.html");
    return res.status(302).sendFile(pathFile);
};

const gerenciarInfoData = async (req, res) => {
    // esse middleware pegara informações de usuario como produtos e propostas

    const { id } = req.user;

    const userInfo = await UsuarioModel.findByPk(id, {
        attributes: ["id", "nome", "email"],
        include: [
            {
                model: Avatar,
            },
            {
                model: ProductModel,
                required: false,
                attributes: ["id", "nome", "visivel", "disponivel"],
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
                model: PropostaDeTroca,
                as: "propostaEfetuadaID",
                required: false,
                attributes: [
                    "id",
                    "data_proposta",
                    "proposta_ativa",
                    "proposta_aceita",
                    "proposta_recusada",
                    "proposta_cancelada",
                ],
                include: [
                    {
                        model: PropostaProdutos,
                        required: false,
                        attributes: [
                            "id_produto_requisitado",
                            "id_produto_oferecido",
                        ],
                    },
                ],
            },
            {
                model: PropostaDeTroca,
                as: "propostaRecebidaID",
                required: false,
                attributes: [
                    "id",
                    "data_proposta",
                    "proposta_ativa",
                    "proposta_aceita",
                    "proposta_recusada",
                    "proposta_cancelada",
                ],
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

const gerenciarProdutoAlterar = async (req, res) => {
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

const gerenciarProdutoExcluir = async (req, res) => {
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

const gerenciarPropostaRecusar = async (req, res) => {
    const { id } = req.params;

    const proposta = await PropostaDeTroca.findByPk(Number(id), {
        attributes: ["id_dono_do_produto"],
    });

    if (req.user.id !== proposta.id_dono_do_produto) {
        return res.status(400).json({
            success: false,
            msg: "Falha ao recusar proposta",
        });
    }

    const update = await PropostaDeTroca.update(
        { proposta_recusada: 1, proposta_ativa: 0 },
        {
            where: { id: Number(id) },
        }
    );

    console.log(id);

    res.status(201).json({
        success: true,
        msg: "proposta recusada com sucesso!",
    });
};

const gerenciarPropostaCancelar = async (req, res) => {
    const { id } = req.params;

    const proposta = await PropostaDeTroca.findByPk(Number(id), {
        attributes: ["id_usuario_interessado"],
    });

    console.log(proposta);

    if (req.user.id !== proposta.id_usuario_interessado) {
        return res.status(400).json({
            success: false,
            msg: "Falha ao cancelar proposta",
        });
    }

    const update = await PropostaDeTroca.update(
        { proposta_cancelada: 1, proposta_ativa: 0 },
        {
            where: { id: Number(id) },
        }
    );

    console.log(update);

    res.status(201).json({
        success: true,
        msg: "proposta cancelada com sucesso!",
    });
};
const gerenciarPropostaAceitar = async (req, res) => {
    const { id } = req.params;

    const proposta = await PropostaDeTroca.findByPk(Number(id), {
        attributes: ["id_dono_do_produto"],
        include: [
            {
                model: PropostaProdutos,
                attributes: ["id_produto_requisitado", "id_produto_oferecido"],
                include: [
                    {
                        attributes: ["id", "disponivel"],
                        model: ProductModel,
                        as: "produtosOferecidosID",
                    },
                ],
            },
        ],
    });

    if (req.user.id !== proposta.id_dono_do_produto) {
        return res.status(400).json({
            success: false,
            msg: "Falha ao aceitar proposta",
        });
    }

    const idProdutoRequisitado =
        proposta.proposta_produtos[0].id_produto_requisitado;
    const idProdutosOferecidos = proposta.proposta_produtos.map(
        (produto) => produto.id_produto_oferecido
    );

    const idsProdutos = [...idProdutosOferecidos, idProdutoRequisitado];

    const validarProduto = await ProductModel.findAll({
        attributes: ["id"],
        where: {
            id: idsProdutos,
            [Op.and]: {
                disponivel: 1,
            },
        },
    });

    if (validarProduto.length !== idsProdutos.length) {
        return res.status(400).json({
            success: false,
            msg: "Falha ao aceitar proposta",
        });
    }

    const updatePropostaPrincipal = await PropostaDeTroca.update(
        { proposta_aceita: 1, proposta_ativa: 0 },
        {
            where: { id: Number(id) },
        }
    );

    const updateProdutos = await ProductModel.update(
        { disponivel: 0 },
        {
            where: { id: idsProdutos },
        }
    );

    const propostasSecundarias = await PropostaProdutos.findAll({
        attributes: ["id_proposta"],
        where: { id_produto_oferecido: idsProdutos },
    });

    const idsPropostas = propostasSecundarias.map(
        (proposta) => proposta.id_proposta
    );

    console.log(idsPropostas);
    console.log(propostasSecundarias);

    const propostasSecundariasUpdate = await PropostaDeTroca.update(
        {
            proposta_cancelada: 1,
            proposta_ativa: 0,
        },
        {
            where: {
                id: idsPropostas,
                [Op.and]: {
                    proposta_ativa: 1,
                },
            },
        }
    );

    res.status(201).json({
        success: true,
        msg: "proposta aceita!",
    });
};

const gerenciarInfoDataChat = async (req, res) => {
    const { id } = req.params;
    const userInfo = req.user;

    const propostaInfo = await PropostaDeTroca.findByPk(Number(id), {
        attributes: ["id_dono_do_produto", "id_usuario_interessado"],
        include: [
            {
                model: PropostaChat,
                attributes: ["id_remetente", "mensagem", "data_hora_mensagem"],
            },
        ],
    });

    if (
        propostaInfo.id_dono_do_produto !== userInfo.id &&
        propostaInfo.id_usuario_interessado !== userInfo.id
    ) {
        return res.status(401).json({
            msg: "Falha ao receber os dados. Usuário não autorizado!",
        });
    }

    const mensagem = tratarMensagens(propostaInfo.proposta_chats);

    const data = {
        users: {
            remetente: userInfo.id,
            destinatario:
                propostaInfo.id_dono_do_produto == userInfo.id
                    ? propostaInfo.id_usuario_interessado
                    : propostaInfo.id_dono_do_produto,
        },
        messages: mensagem,
    };

    res.status(200).json({ msg: "success", data: data });
};

const gerenciarInfoDataChatPost = async (req, res) => {
    const { id } = req.params;
    const userInfo = req.user;
    const formInfo = req.body;

    const propostaInfo = await PropostaDeTroca.findByPk(Number(id), {
        attributes: ["id_dono_do_produto", "id_usuario_interessado"],
    });

    console.log(formInfo);

    if (
        propostaInfo.id_dono_do_produto !== Number(formInfo.remente) &&
        propostaInfo.id_usuario_interessado !== Number(formInfo.remente) &&
        propostaInfo.id_dono_do_produto !== Number(formInfo.destinatario) &&
        propostaInfo.id_usuario_interessado !== Number(formInfo.destinatario)
    ) {
        return res.status(401).json({
            msg: "Falha ao receber os dados. Usuário não autorizado!",
        });
    }

    await PropostaChat.create({
        id_remetente: Number(formInfo.remetente),
        id_destinatario: Number(formInfo.destinatario),
        id_proposta: Number(formInfo.proposta),
        mensagem: formInfo.mensagem,
    });

    const propostaInfoRetorno = await PropostaDeTroca.findByPk(Number(id), {
        include: [
            {
                model: PropostaChat,
                attributes: ["id_remetente", "mensagem", "data_hora_mensagem"],
            },
        ],
    });

    const mensagem = tratarMensagens(propostaInfoRetorno.proposta_chats);

    const data = {
        messages: mensagem,
    };

    res.status(201).json({ msg: "success", data: data });
};

const gerenciarUsuarioUpdateAvatar = async (req, res) => {
    const avatar = req.body;
    const user = req.user;

    if (!avatar) {
        return res.status(400).json({ msg: "Falha ao modificar avatar..." });
    }

    const avatarId = await Avatar.findOne({
        attributes: ["id"],
        where: { img_path: avatar.src },
    });

    if (!avatarId) {
        return res
            .status(400)
            .json({ msg: "Não foi possível encontrar o id do avatar" });
    }

    const update = await UsuarioModel.update(
        {
            img_id: avatarId.id,
        },
        {
            where: {
                id: user.id,
            },
        }
    );

    console.log(update);

    return res
        .status(201)
        .json({ msg: "alteração feita com sucesso!!", data: avatarId.id });
};

module.exports = {
    gerenciar,
    gerenciarPage,
    gerenciarInfoData,
    gerenciarProdutoAlterar,
    gerenciarProdutoExcluir,
    gerenciarPropostaRecusar,
    gerenciarPropostaCancelar,
    gerenciarPropostaAceitar,
    gerenciarInfoDataChat,
    gerenciarInfoDataChatPost,
    gerenciarUsuarioUpdateAvatar,
};
