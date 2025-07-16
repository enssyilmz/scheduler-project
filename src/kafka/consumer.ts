import { Kafka } from 'kafkajs';
import { writeOrUpdateUser, writeToServiceAppConfig, writeOrUpdateTodo } from '../db';

const kafka = new Kafka({
  clientId: 'consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'consumer-group' });

class UserProcessor {
  async process(users: any[]) {
    for (const user of users) {
      console.log(`[KAFKA] User işleniyor: ${user.name} (${user.username})`);
      try {
        await writeOrUpdateUser(user);
      } catch (err) {
        console.error(`[KAFKA] Users tablosuna kayıt hatası:`, err);
      }

      try {
        await writeToServiceAppConfig(user);
      } catch (err) {
        console.error(`[KAFKA] ServiceAppConfig tablosuna kayıt hatası:`, err);
      }
    }
  }
}

class TodoProcessor {
  async process(todos: any[]) {
    for (const todo of todos) {
      console.log(`[KAFKA] Todo işleniyor: ${todo.title}`);
      try {
        await writeOrUpdateTodo(todo);
      } catch (err) {
        console.error(`[KAFKA] Todos tablosuna kayıt hatası:`, err);
      }
    }
  }
}

export async function startKafkaConsumer() {
  try {
    console.log("[KAFKA] Kafka consumer'a bağlanılmaya çalışılıyor...");
    console.log(`[KAFKA] Broker adresi: ${process.env.KAFKA_BROKER || 'localhost:9092'}`);
    
    await consumer.connect();
    console.log("[KAFKA] Kafka consumer başarıyla bağlandı");

    await consumer.subscribe({ topic: 'free-api-data', fromBeginning: true });
    console.log("[KAFKA] Topic'e subscribe olundu: free-api-data");

    const userProcessor = new UserProcessor();
    const todoProcessor = new TodoProcessor();

    await consumer.run({
      eachMessage: async ({ message, partition }) => {
        try {
          console.log(`[KAFKA] Yeni mesaj alındı! Partition: ${partition}`);
          const data = JSON.parse(message.value?.toString() || '[]');
          console.log(`[KAFKA] Kafka'dan veri alındı: ${data.length} adet kayıt`);

          const users = data.filter((item: any) => item.name && item.username);
          const todos = data.filter((item: any) => item.title && item.completed !== undefined);

          console.log(`[KAFKA] Users: ${users.length} adet`);
          console.log(`[KAFKA] Todos: ${todos.length} adet`);

          if (users.length > 0) {
            await userProcessor.process(users);
          }
          
          if (todos.length > 0) {
            await todoProcessor.process(todos);
          }
        } catch (error) {
          console.error('[KAFKA] Mesaj işleme hatası:', error);
        }
      },
    });
  } catch (error: any) {
    console.error('[KAFKA] Kafka consumer başlatma hatası:', error);
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('[KAFKA] Kafka broker\'a bağlanılamıyor. Docker container\'ın çalıştığından emin olun.');
      console.error('[KAFKA] Çözüm: docker-compose up -d komutunu çalıştırın');
    }
    
    setTimeout(() => {
      console.log('[KAFKA] 10 saniye sonra tekrar deneniyor...');
      startKafkaConsumer();
    }, 10000);
  }
}
