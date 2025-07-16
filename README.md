# Scheduler Project

Kafka ve MSSQL ile çalışan otomatik veri toplama ve işleme projesi. JSONPlaceholder API'sinden düzenli olarak veri çeker, veritabanında saklar ve Kafka üzerinden mesajlaşma yapar.

## 🚀 Özellikler

- **Otomatik Veri Toplama**: Her dakika JSONPlaceholder API'sinden users ve todos verilerini çeker
- **Veritabanı Yönetimi**: MSSQL Server ile veri saklama ve güncelleme
- **Kafka Entegrasyonu**: Producer ve Consumer ile mesaj kuyruğu sistemi
- **Cache Mekanizması**: Gereksiz veritabanı işlemlerini önlemek için cache yapısı
- **TypeScript**: Tip güvenliği ve modern JavaScript özellikleri

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Node.js**: 18.x veya üzeri
- **npm**: 6.x veya üzeri
- **Docker**: 20.x veya üzeri
- **Docker Compose**: 2.x veya üzeri

### Veritabanı Gereksinimleri
- **MSSQL Server**: 2019 veya üzeri
- Aşağıdaki tablolar oluşturulmuş olmalı:
  - `users` tablosu
  - `todos` tablosu  
  - `tb_service_app_config` tablosu

## 🛠️ Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/yourusername/scheduler-project.git
cd scheduler-project
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Docker ve Kafka'yı Başlatın
```bash
# Kafka ve Zookeeper servislerini başlat
npm run kafka:start

# Veya direkt docker-compose ile
docker-compose up -d
```

### 4. Environment Ayarları
Proje kök dizininde `.env` dosyası oluşturun:
```env
# Kafka Configuration
KAFKA_BROKER=localhost:9092

# Database Configuration
SQL_SERVER=localhost
DB_USER=sa
DB_PASSWORD=yourpassword
DB_NAME=Softtech
```

### 5. Projeyi Build Edin
```bash
npm run build
```

## 🚦 Çalıştırma

### Development Modu
```bash
npm run dev
```

### Production Modu
```bash
npm start
```

### Docker Servisleri Yönetimi
```bash
# Kafka ve Zookeeper'ı başlat
npm run kafka:start

# Kafka ve Zookeeper'ı durdur
npm run kafka:stop

# Docker loglarını görüntüle
npm run docker:logs
```

## 🏗️ Proje Yapısı
scheduler-project/
├── src/
│ ├── cache.ts # Cache yönetimi
│ ├── db.ts # Veritabanı işlemleri
│ ├── index.ts # Ana uygulama
│ ├── scheduler.ts # Cron job tanımları
│ └── kafka/
│ ├── consumer.ts # Kafka consumer
│ └── producer.ts # Kafka producer
├── docker-compose.yml # Docker servisleri
├── package.json
├── tsconfig.json
└── README.md

## 📊 Veritabanı Tabloları

### users tablosu
```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50),
    username NVARCHAR(50),
    email NVARCHAR(50),
    phone NVARCHAR(MAX),
    website NVARCHAR(50),
    create_user NVARCHAR(50),
    create_date DATETIME,
    modify_date DATETIME NULL
);
```

### todos tablosu
```sql
CREATE TABLE todos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT,
    title NVARCHAR(MAX),
    completed BIT,
    create_user NVARCHAR(50),
    create_date DATETIME,
    modify_date DATETIME NULL
);
```

### tb_service_app_config tablosu
```sql
CREATE TABLE tb_service_app_config (
    id INT IDENTITY(1,1) PRIMARY KEY,
    [key] NVARCHAR(50),
    status NVARCHAR(50),
    datetime DATETIME,
    users NVARCHAR(50)
);
```

## 🔧 Yapılandırma

### Cache Ayarları
Cache süresi varsayılan olarak 60 saniyedir. `src/cache.ts` dosyasından değiştirilebilir:

```typescript
export const myCache = new NodeCache({
  stdTTL: 60, // 60 saniye
  checkperiod: 60,
  useClones: false
});
```

### Scheduler Ayarları
Veri çekme sıklığı `src/scheduler.ts` dosyasında ayarlanabilir:

```typescript
cron.schedule("* * * * *", async () => {
  // Her dakika çalışır
});
```

## 📈 Monitoring

### Kafka UI
Kafka'yı görsel olarak yönetmek için:
- URL: http://localhost:8080
- Username/Password: Gerekmiyor

### Loglar
```bash
# Uygulama logları
npm run dev

# Docker servisleri logları
npm run docker:logs

# Sadece Kafka logları
docker logs kafka

# Sadece Zookeeper logları
docker logs zookeeper
```

## 🚨 Sorun Giderme

### Kafka Bağlantı Sorunu
```bash
# Container'ların çalışıp çalışmadığını kontrol edin
docker ps

# Kafka servisini yeniden başlatın
docker-compose restart kafka

# Port kontrolü
netstat -an | findstr 9092
```

### Veritabanı Bağlantı Sorunu
1. MSSQL Server'ın çalıştığından emin olun
2. `.env` dosyasındaki bağlantı bilgilerini kontrol edin
3. Firewall ayarlarını kontrol edin

### Port Çakışması
Eğer portlar kullanımda ise `docker-compose.yml` dosyasında port numaralarını değiştirin:

```yaml
services:
  kafka:
    ports:
      - "9093:9092"  # 9092 yerine 9093 kullan
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi: Muhammed Enes Yılmaz
Email: enssyilmzx@gmail.com
