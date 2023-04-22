const { sequelize, DataTypes } = require("../db/connect");

const ValoresInput = sequelize.define(
    "valores_input_produto",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        valor: {
            type: DataTypes.STRING(14),
            allowNull: false,
            unique: true,
        },
    },
    { tableName: "valores_input_produto", timestamps: false }
);

module.exports = ValoresInput;
