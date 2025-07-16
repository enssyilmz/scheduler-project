"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleJob = scheduleJob;
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const db_1 = require("./db");
const cache_1 = require("./cache");
const producer_1 = require("./kafka/producer");
function scheduleJob() {
    console.log("[SCHEDULER] Scheduler başlatılıyor...");
    node_cron_1.default.schedule("* * * * *", () => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("[SCHEDULER] API'den veri çekiliyor...");
            const responseusers = yield axios_1.default.get("https://jsonplaceholder.typicode.com/users");
            const responsetodos = yield axios_1.default.get("https://jsonplaceholder.typicode.com/todos");
            const users = responseusers.data;
            const todos = responsetodos.data;
            const cachedUsers = cache_1.myCache.get("users");
            const cachedTodos = cache_1.myCache.get("todos");
            if (JSON.stringify(cachedUsers) !== JSON.stringify(users)) {
                console.log("[SCHEDULER] Kullanıcı verisi değişti veya ilk yüklenme, işleniyor...");
                let successCount = 0;
                for (const user of users) {
                    const userSuccess = yield (0, db_1.writeOrUpdateUser)(user);
                    const configSuccess = yield (0, db_1.writeToServiceAppConfig)(user);
                    if (userSuccess && configSuccess)
                        successCount++;
                }
                console.log(`[SCHEDULER] Users tablosunda ${successCount}/${users.length} kayıt başarıyla işlendi`);
                cache_1.myCache.set("users", users);
                try {
                    yield (0, producer_1.sendToKafka)(users);
                }
                catch (kafkaError) {
                    console.error("[SCHEDULER] Kafka'ya users gönderme hatası:", kafkaError);
                }
            }
            else {
                console.log("[SCHEDULER] Kullanıcı verisi aynı, veritabanı işlemi yapılmıyor.");
            }
            if (JSON.stringify(cachedTodos) !== JSON.stringify(todos)) {
                console.log("[SCHEDULER] Todos verisi değişti veya ilk yüklenme, işleniyor...");
                let successCount = 0;
                for (const todo of todos) {
                    const success = yield (0, db_1.writeOrUpdateTodo)(todo);
                    if (success)
                        successCount++;
                }
                console.log(`[SCHEDULER] Todos tablosunda ${successCount}/${todos.length} kayıt başarıyla işlendi`);
                cache_1.myCache.set("todos", todos);
                try {
                    yield (0, producer_1.sendToKafka)(todos);
                }
                catch (kafkaError) {
                    console.error("[SCHEDULER] Kafka'ya todos gönderme hatası:", kafkaError);
                }
            }
            else {
                console.log("[SCHEDULER] Todos verisi aynı, veritabanı işlemi yapılmıyor.");
            }
        }
        catch (err) {
            console.error("[SCHEDULER] API çekme hatası:", err);
        }
    }));
    console.log("[SCHEDULER] Scheduler kuruldu – her dakika çalışacak.");
}
//# sourceMappingURL=scheduler.js.map