"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("../utils/env");
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize((0, env_1.getEnv)("DB_NAME"), (0, env_1.getEnv)("DB_USER"), (0, env_1.getEnv)("DB_PASSWORD", true), {
    host: (0, env_1.getEnv)("DB_HOST"),
    port: parseInt((0, env_1.getEnv)("DB_PORT"), 10),
    dialect: "mysql",
    logging: false,
});
exports.default = sequelize;
