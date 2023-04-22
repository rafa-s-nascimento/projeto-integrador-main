const { sequelize, DataTypes } = require("../db/connect");

const Password = sequelize.define(
    "usuario_password",
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
            unique: true,
        },
        senha: {
            type: DataTypes.STRING(8),
            allowNull: false,
        },
    },
    { tableName: "usuario_password", timestamps: false }
);

module.exports = Password;
