const { sequelize, DataTypes } = require("../db/connect");

const Usuario = require("./usuarioModel");
const ValoresInput = require("./valoresInputModels");

const Produto = sequelize.define(
    "produto",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nome: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        intencao_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        categoria_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        condicao_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        descricao: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        visivel: {
            type: DataTypes.BOOLEAN,
        },
    },
    { tableName: "produto" }
);

// cria a tabela se ela não existe
// Produto.sync();

// indica que a tabela produtos tem uma restrição a tabela usuario

Usuario.hasMany(Produto, {
    foreignKey: "usuario_id",
});
Produto.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "usuario_id",
    foreignKeyConstraint: { name: "produto_usuario" },
});

Produto.belongsTo(ValoresInput, {
    constraint: true,
    foreignKey: "intencao_id",
    as: "intencaoId",
    foreignKeyConstraint: { name: "produto_ibfk_1" },
});
Produto.belongsTo(ValoresInput, {
    constraint: true,
    foreignKey: "categoria_id",
    as: "categoriaId",
    foreignKeyConstraint: { name: "produto_ibfk_2" },
});
Produto.belongsTo(ValoresInput, {
    constraint: true,
    foreignKey: "tipo_id",
    as: "tipoId",
    foreignKeyConstraint: { name: "produto_ibfk_3" },
});
Produto.belongsTo(ValoresInput, {
    constraint: true,
    foreignKey: "condicao_id",
    as: "condicaoId",
    foreignKeyConstraint: { name: "produto_ibfk_4" },
});

module.exports = Produto;
