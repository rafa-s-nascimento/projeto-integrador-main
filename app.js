const path = require("path");

const express = require("express");
const app = express();
require("dotenv").config();

const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

// rotas
const products = require("./routes/productsRouter");
const login = require("./routes/loginRouter");
const cadastro = require("./routes/cadastroRouter");
const gerenciar = require("./routes/gerenciarRouter");
const cadastroProduto = require("./routes/cadastroProdutoRouter");
const minhaConta = require("./routes/minha-contaRouter");

// responsável por decodificar o body de post enviados no formato json
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());

// erros
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/not-found");

// responsável por responder as requisições de itens estaticos
app.use(express.static("./public"));

// responsável por direcionar as requisições de base '/products'
app.use("/products", products);

// responsável por direcionar as requisições de base '/login'
app.use("/login", login);

// responsável por direcionar as requisições de base '/cadastro'
app.use("/cadastro", cadastro);

// responsável por direcionar requisições de gerenciamento
app.use("/gerenciar", gerenciar);
app.use("/minha-conta", minhaConta);

app.use("/cadastrar-produto", cadastroProduto);

// resposáveis por enviar mensagens de erro.
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        app.listen(port, () => {
            console.log("o servidor está ouvindo na porta " + port);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
