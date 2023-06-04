const express = require("express");
const app = express();
// const cors = require("cors");
require("dotenv").config();

const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const { avatars } = require("./controllers/avatarsController.js");

// rotas
const products = require("./routes/productsRouter");
const login = require("./routes/loginRouter");
const cadastro = require("./routes/cadastroRouter");
const gerenciar = require("./routes/gerenciarRouter");
const cadastroProduto = require("./routes/cadastroProdutoRouter");
const minhaConta = require("./routes/minha-contaRouter");

// decodificadores
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());

// erros
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/not-found");

// app.use(cors({ origin: false }));

// responsável por responder as requisições de itens estaticos
app.use(express.static("./public"));

// responsável por direcionar as requisições de base '/products'
app.use("/products", products);

// responsável por direcionar as requisições de base '/login'
app.use("/login", login);

// responsável por direcionar as requisições de base '/cadastro'
app.use("/cadastro", cadastro);

// responsável por direcionar requisições de gerenciamento
app.use("/minha-conta", minhaConta);
app.use("/gerenciar", gerenciar);

app.use("/cadastrar-produto", cadastroProduto);

app.use("/avatars", avatars);

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
