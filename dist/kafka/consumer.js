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
exports.startKafkaConsumer = startKafkaConsumer;
const kafkajs_1 = require("kafkajs");
const db_1 = require("../db");
const kafka = new kafkajs_1.Kafka({
    clientId: 'consumer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});
const consumer = kafka.consumer({ groupId: 'consumer-group' });
class UserProcessor {
    process(users) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const user of users) {
                console.log(`[KAFKA] User işleniyor: ${user.name} (${user.username})`);
                try {
                    yield (0, db_1.writeOrUpdateUser)(user);
                }
                catch (err) {
                    console.error(`[KAFKA] Users tablosuna kayıt hatası:`, err);
                }
                try {
                    yield (0, db_1.writeToServiceAppConfig)(user);
                }
                catch (err) {
                    console.error(`[KAFKA] ServiceAppConfig tablosuna kayıt hatası:`, err);
                }
            }
        });
    }
}
class TodoProcessor {
    process(todos) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const todo of todos) {
                console.log(`[KAFKA] Todo işleniyor: ${todo.title}`);
                try {
                    yield (0, db_1.writeOrUpdateTodo)(todo);
                }
                catch (err) {
                    console.error(`[KAFKA] Todos tablosuna kayıt hatası:`, err);
                }
            }
        });
    }
}
function startKafkaConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("[KAFKA] Kafka consumer'a bağlanılmaya çalışılıyor...");
            console.log(`[KAFKA] Broker adresi: ${process.env.KAFKA_BROKER || 'localhost:9092'}`);
            yield consumer.connect();
            console.log("[KAFKA] Kafka consumer başarıyla bağlandı");
            yield consumer.subscribe({ topic: 'free-api-data', fromBeginning: true });
            console.log("[KAFKA] Topic'e subscribe olundu: free-api-data");
            const userProcessor = new UserProcessor();
            const todoProcessor = new TodoProcessor();
            yield consumer.run({
                eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message, partition }) {
                    var _b;
                    try {
                        console.log(`[KAFKA] Yeni mesaj alındı! Partition: ${partition}`);
                        const data = JSON.parse(((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()) || '[]');
                        console.log(`[KAFKA] Kafka'dan veri alındı: ${data.length} adet kayıt`);
                        const users = data.filter((item) => item.name && item.username);
                        const todos = data.filter((item) => item.title && item.completed !== undefined);
                        console.log(`[KAFKA] Users: ${users.length} adet`);
                        console.log(`[KAFKA] Todos: ${todos.length} adet`);
                        if (users.length > 0) {
                            yield userProcessor.process(users);
                        }
                        if (todos.length > 0) {
                            yield todoProcessor.process(todos);
                        }
                    }
                    catch (error) {
                        console.error('[KAFKA] Mesaj işleme hatası:', error);
                    }
                }),
            });
        }
        catch (error) {
            console.error('[KAFKA] Kafka consumer başlatma hatası:', error);
            if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('ECONNREFUSED')) {
                console.error('[KAFKA] Kafka broker\'a bağlanılamıyor. Docker container\'ın çalıştığından emin olun.');
                console.error('[KAFKA] Çözüm: docker-compose up -d komutunu çalıştırın');
            }
            setTimeout(() => {
                console.log('[KAFKA] 10 saniye sonra tekrar deneniyor...');
                startKafkaConsumer();
            }, 10000);
        }
    });
}
//# sourceMappingURL=consumer.js.map