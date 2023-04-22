const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: "localhost",
        dialect: "mysql",
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log("conexão realizada com sucesso!");
    })
    .catch(() => {
        console.log("Erro ao conectar com banco de dados...");
    });

module.exports = { sequelize, DataTypes };

// para evitar o problema das associações é preciso fazer a associação dentro de um model apenas

// exemplo: Se uma foto pertence a um produto e um produto pode ter várias fotos

// Produto.hasMany(ImagensProduto, {
//     foreignKey: "produto_id",
// });
// ImagensProduto.belongsTo(Produto, {
//     constraint: true,
//     foreignKey: "produto_id",
//     foreignKeyConstraint: { name: "imagens_produto_ibf_1" },
// });

// nesse caso, ambas associações são feitas para que seja possível através da busca de uma foto
// conseguir trazer um produto e vice e versa.

// ao fazer essa associação, ambos modais ganham novos métodos e é possivel trazer a imagem usando
// o método "get".

// Exemplo: const produto = await Produto.findByPk(231) -- é trazido o produto com pk = 231
// e em seguida é possível usar o produto retornado para trazer associações
// const img = produto.getImagens_produto() -- retorna as imagens associadas ao produto.
// OBS: método é "get" + <nome da tabela> no padrão camelCase. **não confundir com o nome da variavel**
