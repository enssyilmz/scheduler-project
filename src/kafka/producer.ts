import { Kafka } from "kafkajs";

const kafka = new Kafka({ 
  clientId: "scheduler-app", 
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"] 
});
const producer = kafka.producer();

export async function sendToKafka(data: any) {
  try {
    console.log("[KAFKA] Kafka producer'a bağlanılıyor...");
    await producer.connect();
    console.log(`[KAFKA] Kafka'ya ${data.length} adet veri gönderiliyor...`);
    
    await producer.send({
      topic: "free-api-data",
      messages: [{ value: JSON.stringify(data) }],
    });
    
    console.log("[KAFKA] Veri Kafka'ya başarıyla gönderildi!");
    await producer.disconnect();
    console.log("[KAFKA] Kafka producer bağlantısı kapatıldı");
  } catch (error) {
    console.error("[KAFKA] Kafka producer hatası:", error);
    throw error;
  }
}
