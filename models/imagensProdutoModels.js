const { sequelize, DataTypes } = require("../db/connect");
const Produto = require("./productModel");

const ImagensProduto = sequelize.define(
    "imagens_produto",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        produto_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        img_path: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
    },
    { tableName: "imagens_produto", timestamps: false }
);

Produto.hasMany(ImagensProduto, {
    foreignKey: "produto_id",
    as: "produtoImg",
});
ImagensProduto.belongsTo(Produto, {
    constraint: true,
    foreignKey: "produto_id",
    as: "produtoImg",
    foreignKeyConstraint: { name: "imagens_produto_ibf_1" },
});

module.exports = ImagensProduto;
