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
Object.defineProperty(exports, "__esModule", { value: true });
const consumer_1 = require("./kafka/consumer");
const scheduler_1 = require("./scheduler");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("[INDEX] === SCHEDULER PROJESI BAŞLATILIYOR ===");
        try {
            yield (0, consumer_1.startKafkaConsumer)();
            console.log("[INDEX] Kafka Consumer başarıyla başlatıldı");
        }
        catch (err) {
            console.error("[INDEX] Kafka Consumer başlatma hatası:", err);
        }
        try {
            (0, scheduler_1.scheduleJob)();
            console.log("[INDEX] Scheduler başarıyla başlatıldı");
        }
        catch (err) {
            console.error("[INDEX] Scheduler başlatma hatası:", err);
        }
        console.log("[INDEX] === PROJE BAŞARIYLA BAŞLATILDI ===");
    });
}
main().catch((error) => {
    console.error("[INDEX] Ana fonksiyon hatası:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map