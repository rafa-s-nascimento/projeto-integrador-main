const { NOW } = require("sequelize");
const { sequelize, DataTypes } = require("../db/connect");
const Usuario = require("./usuarioModel");

const PropostaDeTroca = sequelize.define(
    "proposta_troca",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        id_dono_do_produto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_usuario_interessado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        data_proposta: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        proposta_aceita: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        proposta_ativa: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1,
        },
        proposta_recusada: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        proposta_cancelada: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
    },
    { tableName: "proposta_troca", timestamps: false }
);

PropostaDeTroca.sync();

PropostaDeTroca.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "id_dono_do_produto",
    as: "propostaRecebidaID",
    foreignKeyConstraint: { name: "dono_proposta" },
});
PropostaDeTroca.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "id_usuario_interessado",
    as: "propostaEfetuadaID",
    foreignKeyConstraint: { name: "interessado_proposta" },
});

Usuario.hasMany(PropostaDeTroca, {
    foreignKey: "id_dono_do_produto",
    as: "propostaRecebidaID",
});
Usuario.hasMany(PropostaDeTroca, {
    foreignKey: "id_usuario_interessado",
    as: "propostaEfetuadaID",
});

module.exports = PropostaDeTroca;
