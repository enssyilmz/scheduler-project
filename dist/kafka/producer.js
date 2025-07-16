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
exports.sendToKafka = sendToKafka;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: "scheduler-app",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});
const producer = kafka.producer();
function sendToKafka(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("[KAFKA] Kafka producer'a bağlanılıyor...");
            yield producer.connect();
            console.log(`[KAFKA] Kafka'ya ${data.length} adet veri gönderiliyor...`);
            yield producer.send({
                topic: "free-api-data",
                messages: [{ value: JSON.stringify(data) }],
            });
            console.log("[KAFKA] Veri Kafka'ya başarıyla gönderildi!");
            yield producer.disconnect();
            console.log("[KAFKA] Kafka producer bağlantısı kapatıldı");
        }
        catch (error) {
            console.error("[KAFKA] Kafka producer hatası:", error);
            throw error;
        }
    });
}
//# sourceMappingURL=producer.js.map