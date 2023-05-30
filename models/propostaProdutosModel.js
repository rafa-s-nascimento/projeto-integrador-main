const { sequelize, DataTypes } = require("../db/connect");
const Proposta = require("./propostaModel");
const Produto = require("./productModel");

// tabela de relacionamento fraco, relaciona os produtos oferecidos para
// cara produto alvo em uma proposta
const PropostaProdutos = sequelize.define(
    "proposta_produtos",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        id_proposta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_produto_requisitado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_produto_oferecido: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    { tableName: "proposta_produtos", timestamps: false }
);

// PropostaProdutos.sync();

PropostaProdutos.belongsTo(Proposta, {
    constraint: true,
    foreignKey: "id_proposta",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_1" },
});
Proposta.hasMany(PropostaProdutos, {
    constraint: true,
    foreignKey: "id_proposta",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_1" },
});

PropostaProdutos.belongsTo(Produto, {
    constraint: true,
    foreignKey: "id_produto_requisitado",
    as: "produtosRequisitadosID",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_2" },
});
Produto.hasMany(PropostaProdutos, {
    constraint: true,
    foreignKey: "id_produto_requisitado",
    as: "produtosRequisitadosID",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_2" },
});

PropostaProdutos.belongsTo(Produto, {
    constraint: true,
    foreignKey: "id_produto_oferecido",
    as: "produtosOferecidosID",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_3" },
});
Produto.hasMany(PropostaProdutos, {
    constraint: true,
    foreignKey: "id_produto_oferecido",
    as: "produtosOferecidosID",
    foreignKeyConstraint: { name: "proposta_produtos_ibfk_3" },
});

module.exports = PropostaProdutos;
