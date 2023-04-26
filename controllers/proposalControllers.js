const ImagensProduto = require("../models/imagensProdutoModels");
const ProductModel = require("../models/productModel");
const PropostaDeTroca = require("../models/propostaModel");
const UsuarioModel = require("../models/usuarioModel");
const PropostaProdutos = require("../models/propostaProdutosModel");

const validarUsuario = (arr_colection, id) => {
    return arr_colection.some((produto) => produto.id == id);
};

const produtosParaTroca = (arr_colection) => {
    return arr_colection.map((produto) => {
        return {
            id: produto.id,
            nome: produto.nome,
            img: { src: produto.produtoImg[0].img_path },
        };
    });
};

const testarProposta = async () => {
    const usuario = await UsuarioModel.findByPk(1, {
        include: [
            {
                model: PropostaDeTroca,
                as: "propostaRecebidaID",
                include: { model: PropostaProdutos },
            },
            {
                model: PropostaDeTroca,
                as: "propostaEfetuadaID",
                include: { model: PropostaProdutos },
            },
        ],
    });

    // console.log(usuario.propostaRecebidaID);
    console.log(usuario.propostaEfetuadaID);
};

// testarProposta();

// controller responsável por enviar os dados quando uma proposta é aberta.
const getInfoProposta = async (req, res) => {
    if (!req.params) {
        return res.status(400).send("Não foi possível localizar o id");
    }

    const id_produto = req.params.productID;
    const interessado = req.user;

    const produtos_requisitante = await ProductModel.findAll({
        include: [{ model: ImagensProduto, as: "produtoImg" }],
        // condicionais
        where: { usuario_id: interessado.id },
    });

    const pertence_ao_requisitante = validarUsuario(
        produtos_requisitante,
        id_produto
    );

    if (pertence_ao_requisitante) {
        return res
            .status(400)
            .send("Não é permitido fazer propostas para si mesmo");
    }

    const produto_requisitado = await ProductModel.findByPk(id_produto, {
        include: [{ model: ImagensProduto, as: "produtoImg" }],
    });

    res.status(200).json({
        proprietario: {
            user: {
                id: produto_requisitado.usuario_id,
            },
            produto: [
                {
                    id: produto_requisitado.id,
                    nome: produto_requisitado.nome,
                    img: { src: produto_requisitado.produtoImg[0].img_path },
                },
            ],
        },
        interessado: {
            user: {
                id: produtos_requisitante.usuario_id,
            },
            produto: produtosParaTroca(produtos_requisitante),
        },
    });
};

// controller responsável por enviar os dados de uma proposta concluida ao servidor
const setInfoProposta = async (req, res) => {
    const params = req.params;
    const url = req.url;
    console.log(params);
    console.log(url);
    res.status(201).json({
        msg: "os dados foram enviados para o servidor",
        success: true,
    });
};

module.exports = {
    getInfoProposta,
    setInfoProposta,
};
