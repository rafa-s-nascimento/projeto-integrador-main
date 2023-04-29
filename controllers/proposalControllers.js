const ImagensProduto = require("../models/imagensProdutoModels");
const ProductModel = require("../models/productModel");
const PropostaDeTroca = require("../models/propostaModel");
const UsuarioModel = require("../models/usuarioModel");
const PropostaProdutos = require("../models/propostaProdutosModel");

const validarUsuario = (arr_colection, id) => {
    return arr_colection.some((produto) => produto.id == id);
};

// verifica se já existe uma proposta exatamente igual feita pela mesma
// pessoa ao mesmo produto e retorna true ou false.
const verificaSePropostaExiste = (bd_colection, nova_proposta) => {
    const propostas = [];
    const novaProposta = nova_proposta.produto.map((obj) => obj.id);
    let propostaExiste = false;

    bd_colection.forEach((proposta_troca) => {
        const temp = [];
        proposta_troca.proposta_produtos.forEach((propostaProduto) =>
            temp.push(propostaProduto.id_produto_oferecido)
        );

        propostas.push(temp);
    });

    for (let i = 0; i < propostas.length; i++) {
        if (novaProposta.length != propostas[i].length) {
            continue;
        }
        const test = novaProposta.every((id) => propostas[i].includes(id));

        if (test) {
            return true;
        }
    }

    return propostaExiste;
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
                id: interessado.id,
            },
            produto: produtosParaTroca(produtos_requisitante),
        },
    });
};

// controller responsável por enviar os dados de uma proposta concluida ao servidor
const setInfoProposta = async (req, res) => {
    let data = null;

    if (!req.body) {
        return res.status(400).json({ msg: "Falha ao enviar proposta" });
    }

    data = req.body;

    const { requisitante, requisitado } = data;

    if (requisitante.id !== req.user.id) {
        return res.status(400).json({
            msg: "Falha ao enviar proposta. Inconsistência nos dados de usuário",
        });
    }

    console.log(requisitado.produto);

    const propostasDoRequisitante = await UsuarioModel.findAll({
        attributes: ["nome"],
        include: [
            {
                model: PropostaDeTroca,
                as: "propostaEfetuadaID",
                include: [
                    {
                        model: PropostaProdutos,
                        where: {
                            id_produto_requisitado: requisitado.produto.id,
                        },
                    },
                ],
            },
        ],
        where: { id: requisitante.id },
    });

    const propostaCProdutoAlvo = propostasDoRequisitante[0].propostaEfetuadaID;

    const validacao = verificaSePropostaExiste(
        propostaCProdutoAlvo,
        requisitante
    );

    if (validacao) {
        return res.status(400).json({
            msg: "Não é permitido enviar mais de uma vez a mesma proposta para esse produto.",
        });
    }

    const proposta = await PropostaDeTroca.create({
        id_dono_do_produto: requisitado.id,
        id_usuario_interessado: requisitante.id,
    });

    for (let i = 0; i < requisitante.produto.length; i++) {
        const propostaProdutos = await PropostaProdutos.create({
            id_proposta: proposta.id,
            id_produto_requisitado: requisitado.produto.id,
            id_produto_oferecido: requisitante.produto[i].id,
        });
    }

    return res.status(201).json({
        msg: "Proposta enviada com sucesso!",
        success: true,
    });
};

module.exports = {
    getInfoProposta,
    setInfoProposta,
};
