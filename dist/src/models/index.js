"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = exports.ProductElement = exports.NewProduct = exports.User = exports.sequelize = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.sequelize = db_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const NewProduct_1 = __importDefault(require("./NewProduct"));
exports.NewProduct = NewProduct_1.default;
const ProductElement_1 = __importDefault(require("./ProductElement"));
exports.ProductElement = ProductElement_1.default;
const Contact_1 = __importDefault(require("./Contact"));
exports.Contact = Contact_1.default;
// Associations entre NewProduct et ProductElement
ProductElement_1.default.belongsTo(NewProduct_1.default, {
    foreignKey: "productId",
    as: "product",
});
NewProduct_1.default.hasMany(ProductElement_1.default, {
    foreignKey: "productId",
    as: "elements",
});
