"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
function getEnv(key, allowEmpty = false) {
    const value = process.env[key];
    if (value === undefined || (!allowEmpty && value === "")) {
        throw new Error(`❌ Variable d'environnement manquante : ${key}`);
    }
    return value;
}
