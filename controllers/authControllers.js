const CustomAPIError = require("../errors/custom-error");
const path = require("path");

const UsuarioModel = require("../models/usuarioModel");
const PasswordModel = require("../models/passwordModel");
const AvatarModel = require("../models/avatarModels");

// const { setUsuario, getUsuario, usuarios } = require("../data");

// instanciando o jason web token
const jwt = require("jsonwebtoken");

// esse middle é responsável por retornar o html da página de login
const login = async (req, res) => {
    const filePath = path.join(__dirname, "../public/login.html");
    res.sendFile(filePath);
};

// esse middle é reponsável por validar um login e atribuir um token
const logar = async (req, res) => {
    const { email, password } = req.body;

    const singleUser = await UsuarioModel.findOne({
        where: { email: email },
        include: [PasswordModel, AvatarModel],
    });

    if (!singleUser) {
        return res.status(401).send("Usuario ou senha incorretos");
    }

    const { id, nome } = singleUser;

    const { senha } = singleUser.usuario_password;

    if (senha !== password) {
        return res.status(401).send("Usuario ou senha incorretos");
    }

    const { img_path } = singleUser.avatar;

    // jwt.sing é responsável por criar o token para enviar ao usuario
    // ele recebe como parametros:
    // payload: conteúdo util, usado para identificar o usuario,
    // secret: o segredo que fica guardado no servidor
    // opicionais: objeto com opcionais
    const token = jwt.sign({ id: id, nome: nome }, process.env.JWT_SECRET, {
        expiresIn: "3d",
    });

    res.cookie("token", "Bearer " + token);
    res.cookie("userInfo", `id=${id},nome=${nome},img=${img_path}`);

    res.status(200).json({
        msg: "acesso consedido",
    });
};

// esse middle é responsável por retorna o html da página de cadastro
const cadastro = async (req, res) => {
    const filePath = path.join(__dirname, "../public/cadastro.html");
    res.sendFile(filePath);
};

// esse middle é responsável por fazer o cadastro
const cadastrar = async (req, res) => {
    const { nome, email, password } = req.body;

    const singleUser = await UsuarioModel.findOne({
        where: { email: email },
        raw: true,
    });

    if (singleUser) {
        return res.status(201).send("Usuario já cadastrado!");
    }

    const novoUsuario = await UsuarioModel.create({
        nome: nome,
        email: email,
        img_id: Math.ceil(Math.random() * 15),
    });

    const { id } = novoUsuario;

    await PasswordModel.create({ usuario_id: id, senha: password });

    return res.status(201).send("success");
};

module.exports = { login, logar, cadastro, cadastrar };
