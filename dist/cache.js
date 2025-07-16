"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
exports.myCache = new node_cache_1.default({
    stdTTL: 60,
    checkperiod: 60,
    useClones: false
});
exports.myCache.set("users", []);
exports.myCache.set("todos", []);
console.log("[CACHE] Cache başlatıldı - TTL: 60 saniye");
//# sourceMappingURL=cache.js.map