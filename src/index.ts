import { startKafkaConsumer } from './kafka/consumer';
import { scheduleJob } from './scheduler';

async function main() {
  console.log("[INDEX] === SCHEDULER PROJESI BAŞLATILIYOR ===");
  
  try {
    await startKafkaConsumer();
    console.log("[INDEX] Kafka Consumer başarıyla başlatıldı");
  } catch (err) {
    console.error("[INDEX] Kafka Consumer başlatma hatası:", err);
  }
  
  try {
    scheduleJob();
    console.log("[INDEX] Scheduler başarıyla başlatıldı");
  } catch (err) {
    console.error("[INDEX] Scheduler başlatma hatası:", err);
  }
  
  console.log("[INDEX] === PROJE BAŞARIYLA BAŞLATILDI ===");
}

main().catch((error) => {
  console.error("[INDEX] Ana fonksiyon hatası:", error);
  process.exit(1);
});
