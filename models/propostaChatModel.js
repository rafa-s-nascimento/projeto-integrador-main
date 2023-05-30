const { sequelize, DataTypes } = require("../db/connect");
const Proposta = require("./propostaModel");
const Usuario = require("./usuarioModel");

// tabela de relacionamento fraco, guarda as mensagens enviadas em
// propostas que estão em negociação
const PropostaChat = sequelize.define(
    "proposta_chat",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        id_remetente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_destinatario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_proposta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mensagem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data_hora_mensagem: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    { timestamps: false }
);

// PropostaChat.sync();

// relação com propota
PropostaChat.belongsTo(Proposta, {
    constraint: true,
    foreignKey: "id_proposta",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_3" },
});
Proposta.hasMany(PropostaChat, {
    constraint: true,
    foreignKey: "id_proposta",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_3" },
});

// relação com usuario rementente
PropostaChat.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "id_remetente",
    as: "usuarioRemetenteID",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_1" },
});
Usuario.hasMany(PropostaChat, {
    constraint: true,
    foreignKey: "id_destinatario",
    as: "usuarioRemetenteID",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_1" },
});

// relação com o usuario destinatario
PropostaChat.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "id_destinatario",
    as: "usuarioDestinatarioID",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_2" },
});
Usuario.hasMany(PropostaChat, {
    constraint: true,
    foreignKey: "id_destinatario",
    as: "usuarioDestinatarioID",
    foreignKeyConstraint: { name: "proposta_chat_ibfk_2" },
});

module.exports = PropostaChat;
