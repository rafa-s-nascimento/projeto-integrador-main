const path = require("path");

// models
const ImagensProduto = require("../models/imagensProdutoModels");
const ProductModel = require("../models/productModel");
const ValoresInput = require("../models/valoresInputModels");

const selectID = (arr, atributo, valor) => {
    return arr.find((obj) => obj[atributo] == valor)["id"];
};
const selectImg = (arr_colection) => {
    return arr_colection.map((img) => {
        return {
            src: img.img_path,
            id: img.id,
        };
    });
};

// retorna todos os produtos
const getProducts = async (req, res) => {
    let params = null;
    let limit = null;

    if (req.params) {
        params = req.params;
    }
    if (req.query.limit) {
        limit = Number(req.query.limit);
    }

    // o productModel.findAll pega a model de determinada tabela e faz um "SELECT * FROM product"
    // ele pode receber um objeto com alguns parametros para modificar o select
    // o atributo raw é importante para que assim possa ser retornado um array simples de objetos.

    const selectProducts = await ProductModel.findAll({
        include: [
            { model: ValoresInput, as: "intencaoId" },
            { model: ValoresInput, as: "categoriaId" },
            { model: ValoresInput, as: "tipoId" },
            { model: ValoresInput, as: "condicaoId" },
            { model: ImagensProduto, as: "produtoImg" },
        ],
        limit: limit,
        where: { visivel: 1, disponivel: 1 },
    });

    const result = selectProducts.map((produto) => {
        return {
            id: produto.id,
            nome: produto.nome,
            intencao: produto.intencaoId.valor,
            categoria: produto.categoriaId.valor,
            tipo: produto.tipoId.valor,
            condicao: produto.condicaoId.valor,
            descricao: produto.descricao,
            img: selectImg(produto.produtoImg),
        };
    });

    res.status(200).json({ data: result });
};

// retorna um produto em específico
const getSingleProduct = async (req, res) => {
    const { id } = req.params;
    const url = req.url;
    const search = req.query;

    // console.log(params);
    // console.log(url);
    // console.log(search);

    // o productModel.findOne pega a model de determinada tabela e faz um "SELECT * FROM product"
    // ele pode receber um objeto com alguns parametros para modificar o select
    // o atributo raw é importante para que assim possa ser retornado um array simples de objetos.
    // nesse caso atributo where faz com que seja buscado o id que é passado como parametro na hora da requisição
    // 'select * from product where id = <id passado como parametro>
    const singleProduct = await ProductModel.findOne({
        include: [
            { model: ValoresInput, as: "intencaoId" },
            { model: ValoresInput, as: "categoriaId" },
            { model: ValoresInput, as: "tipoId" },
            { model: ValoresInput, as: "condicaoId" },
            { model: ImagensProduto, as: "produtoImg" },
        ],
        where: { id: Number(id) },
    });

    const produto = {
        id: singleProduct.id,
        nome: singleProduct.nome,
        intencao: singleProduct.intencaoId.valor,
        categoria: singleProduct.categoriaId.valor,
        tipo: singleProduct.tipoId.valor,
        condicao: singleProduct.condicaoId.valor,
        descricao: singleProduct.descricao,
        img: selectImg(singleProduct.produtoImg),
        visivel: singleProduct.visivel,
        disponivel: singleProduct.disponivel,
    };

    return res.status(200).json({
        msg: "success",
        data: produto,
    });
};

const getAddProductPage = (req, res) => {
    const pathFile = path.join(__dirname, "../private/cadastrar-produto.html");

    res.status(302).sendFile(pathFile);
};

// essa será a rota de confimação para adiconar um produto POST
const setProduct = async (req, res) => {
    const inputs = req.body;
    const imgPath = req.imagePath; //o caminho vira num array de um ou mais itens

    console.log(inputs);

    const { nome, intencao, categoria, tipo, condicao, visivel, descricao } =
        inputs;
    const { id: user_id } = req.user;

    if (nome == "") {
        return res
            .status(401)
            .json({ success: false, msg: "Falha ao cadastrar" });
    }

    const inputValuesBD = await ValoresInput.findAll({ raw: true });

    const produto = await ProductModel.create({
        usuario_id: user_id,
        nome: nome,
        intencao_id: selectID(inputValuesBD, "valor", intencao),
        categoria_id: selectID(inputValuesBD, "valor", categoria),
        tipo_id: selectID(inputValuesBD, "valor", tipo),
        condicao_id: selectID(inputValuesBD, "valor", condicao),
        descricao: descricao,
        visivel: visivel,
    });

    const { id } = produto;

    for (let i = 0; i < imgPath.length; i++) {
        await ImagensProduto.create({
            produto_id: id,
            img_path: imgPath[i],
        });
    }

    return res.status(201).json({ success: true, msg: "Produto cadastrado" });
};

module.exports = {
    getProducts,
    getSingleProduct,
    setProduct,
    getAddProductPage,
};
