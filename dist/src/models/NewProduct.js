"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class NewProduct extends sequelize_1.Model {
}
NewProduct.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    keyword: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    idPostFacebook: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    synonym: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductNew",
    tableName: "products_new",
    timestamps: true,
});
exports.default = NewProduct;
