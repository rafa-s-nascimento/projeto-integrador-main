const { sequelize, DataTypes } = require("../db/connect");

const Avatar = sequelize.define(
    "avatar",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        img_path: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    { tableName: "avatar", timestamps: false }
);

module.exports = Avatar;
