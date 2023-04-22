const { sequelize, DataTypes } = require("../db/connect");
const Password = require("./passwordModel");
const Avatar = require("./avatarModels");

const Usuario = sequelize.define(
    "usuario",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        nome: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true,
        },
        img_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    { tableName: "usuario", timestamps: false }
);

Usuario.hasOne(Password, {
    foreignKey: "usuario_id",
});
Password.belongsTo(Usuario, {
    constraint: true,
    foreignKey: "usuario_id",
    foreignKeyConstraint: { name: "usuario_password_ibfk_1" },
});
Usuario.belongsTo(Avatar, {
    constraint: true,
    foreignKey: "img_id",
    foreignKeyConstraint: { name: "usuario_ibfk_1" },
});

module.exports = Usuario;
