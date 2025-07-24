"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ProductElement extends sequelize_1.Model {
}
ProductElement.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "products_new",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("text", "image"),
        allowNull: false,
    },
    content: sequelize_1.DataTypes.TEXT,
    imageUrl: sequelize_1.DataTypes.STRING,
    caption: sequelize_1.DataTypes.STRING,
    order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductElement",
    tableName: "product_elements",
    timestamps: true,
});
exports.default = ProductElement;
