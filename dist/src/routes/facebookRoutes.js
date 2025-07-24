"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facebookController_1 = require("../controllers/facebookController");
const router = (0, express_1.Router)();
router.get("/facebook/posts", facebookController_1.fetchAllPagesPosts);
exports.default = router;
