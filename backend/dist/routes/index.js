"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportRoutes_1 = __importDefault(require("./reportRoutes"));
const spotRoutes_1 = __importDefault(require("./spotRoutes"));
const zoneRoutes_1 = __importDefault(require("./zoneRoutes"));
const router = (0, express_1.Router)();
router.use('/reports', reportRoutes_1.default);
router.use('/spots', spotRoutes_1.default);
router.use('/zones', zoneRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map