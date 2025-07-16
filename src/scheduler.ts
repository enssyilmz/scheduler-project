import cron from "node-cron";
import axios from "axios";
import { writeOrUpdateUser, writeOrUpdateTodo, writeToServiceAppConfig } from "./db";
import { myCache } from "./cache";
import { sendToKafka } from "./kafka/producer";

export function scheduleJob() {
  console.log("[SCHEDULER] Scheduler başlatılıyor...");

  cron.schedule("* * * * *", async () => {
    try {
      console.log("[SCHEDULER] API'den veri çekiliyor...");
      const responseusers = await axios.get("https://jsonplaceholder.typicode.com/users");
      const responsetodos = await axios.get("https://jsonplaceholder.typicode.com/todos");

      const users = responseusers.data;
      const todos = responsetodos.data;

      const cachedUsers = myCache.get("users");
      const cachedTodos = myCache.get("todos"); 
          
      if (JSON.stringify(cachedUsers) !== JSON.stringify(users)) {
        console.log("[SCHEDULER] Kullanıcı verisi değişti veya ilk yüklenme, işleniyor...");
        let successCount = 0;
        for (const user of users) {
          const userSuccess = await writeOrUpdateUser(user);
          const configSuccess = await writeToServiceAppConfig(user);
          if (userSuccess && configSuccess) successCount++;
        }
        console.log(`[SCHEDULER] Users tablosunda ${successCount}/${users.length} kayıt başarıyla işlendi`);
        myCache.set("users", users);
        
        try {
          await sendToKafka(users);
        } catch (kafkaError) {
          console.error("[SCHEDULER] Kafka'ya users gönderme hatası:", kafkaError);
        }
      } else {
        console.log("[SCHEDULER] Kullanıcı verisi aynı, veritabanı işlemi yapılmıyor.");
      }

      if (JSON.stringify(cachedTodos) !== JSON.stringify(todos)) {
        console.log("[SCHEDULER] Todos verisi değişti veya ilk yüklenme, işleniyor...");
        let successCount = 0;
        for (const todo of todos) {
          const success = await writeOrUpdateTodo(todo);
          if (success) successCount++;
        }
        console.log(`[SCHEDULER] Todos tablosunda ${successCount}/${todos.length} kayıt başarıyla işlendi`);
        myCache.set("todos", todos);
        
        try {
          await sendToKafka(todos);
        } catch (kafkaError) {
          console.error("[SCHEDULER] Kafka'ya todos gönderme hatası:", kafkaError);
        }
      } else {
        console.log("[SCHEDULER] Todos verisi aynı, veritabanı işlemi yapılmıyor.");
      }

    } catch (err) {
      console.error("[SCHEDULER] API çekme hatası:", err);
    }
  });

  console.log("[SCHEDULER] Scheduler kuruldu – her dakika çalışacak.");
}
