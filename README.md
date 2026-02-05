<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🎵 Desme - Audio Player для совместного прослушивания

> Бэкенд для современного аудиоплеера, позволяющего слушать музыку с друзьями в реальном времени
> (типа Spotify + Discord)

## ✨ Основные возможности

- 🔐 **Аутентификация** - OAuth2 через GitHub и Google
- 👤 **Профиль пользователя** - Аватар, баннер, персональная информация
- 🎵 **Управление музыкой** - Загрузка композиций с метаданными
- 📋 **Плейлисты** - Создание и управление плейлистами
- 🎧 **Совместное прослушивание** - Комнаты для группового слушания
- 🔄 **Синхронизация в реальном времени** - WebSocket синхронизация воспроизведения
- 💬 **Чат** - Встроенные сообщения в комнатах
- 👥 **Система друзей** - Добавление и управление друзьями
- 📊 **История прослушивания** - Отслеживание прослушанной музыки
- 📁 **Управление файлами** - Правильное хранилище для аватаров, баннеров и аудиофайлов

## 🚀 Быстрый старт

### Docker Compose (рекомендуется)

```bash
# Клонирование
git clone <repo> && cd auth-service

# Запуск всех сервисов
docker-compose up --build

# Сервер доступен на http://localhost:3000
```

### Локально

```bash
# Установка зависимостей
npm install

# Конфигурация (скопируйте .env.example в .env)
cp .env.example .env

# Запуск в режиме разработки
npm run start:dev

# Сервер доступен на http://localhost:3000
```

**Подробнее:** [Быстрый старт](./QUICKSTART.md)

## 📚 Документация

- 📖 [Полная документация](./DEVELOPMENT.md)
- 🔌 [Примеры API запросов](./API_EXAMPLES.md)
- 🧪 [API Swagger документация](http://localhost:3000/api)

## 🏗️ Архитектура проекта

```
src/
├── auth/                   # OAuth2 интеграция (GitHub, Google)
├── user/                   # Управление пользователями
├── composition/            # Музыкальные композиции
├── playlist/               # Плейлисты
├── rooms/                  # Комнаты для совместного слушания
├── friends/                # Система друзей
├── messages/               # Чат в комнатах
├── playback-history/       # История прослушивания
├── file-storage/           # Управление файлами
├── websocket/              # WebSocket синхронизация
├── config.module.ts        # Конфигурация (БД, Redis, JWT)
└── app.module.ts           # Главный модуль приложения
```

## 🔌 WebSocket События

Приложение использует WebSocket для синхронизации в реальном времени:

```javascript
// Клиент подключается с JWT токеном
const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' },
});

// Присоединение к комнате
socket.emit('join-room', { roomId: 'room-id' });

// Обновление воспроизведения
socket.emit('playback-update', {
  roomId: 'room-id',
  isPlaying: true,
  currentPosition: 120,
  currentTrackIndex: 0,
});

// Отправка сообщения
socket.emit('send-message', {
  roomId: 'room-id',
  content: 'Message content',
  senderId: 'user-id',
});
```

## 🛠️ Технологический стек

### Backend Framework

- **NestJS** - Прогрессивный фреймворк для Node.js
- **TypeScript** - Строгая типизация

### База данных

- **PostgreSQL** - Реляционная база данных
- **TypeORM** - ORM для TypeScript

### Кеширование & Синхронизация

- **Redis** - In-memory кеш
- **Socket.IO** - WebSocket синхронизация

### Аутентификация

- **JWT** - JSON Web Token
- **OAuth2** - GitHub и Google интеграция

### Другое

- **NestJS Swagger** - API документация
- **Class-validator** - DTO валидация
- **Multer** - Загрузка файлов

## 📦 Требования

- Node.js 16+ (тестировано на 18)
- npm или yarn
- PostgreSQL 12+
- Redis 6+
- Docker & docker-compose (опционально)

## 🚀 Основные команды

```bash
# Установка зависимостей
npm install

# Development с hot-reload
npm run start:dev

# Production build
npm run build
npm start

# Тестирование
npm test
npm run test:cov

# Форматирование кода
npm run format
```

## 🔐 Переменные окружения

```env
# Сервер
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/desme_audio

# JWT
JWT_SECRET=your_secure_secret_key

# Redis кеш
REDIS_URL=redis://localhost:6379

# OAuth
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

Полный список в [.env.example](.env.example)

## 🌐 API Endpoints

### Основные маршруты

```
# Аутентификация
POST   /user/auth/github
POST   /user/auth/google

# Пользователь
GET    /user/me                              # Профиль
GET    /user/search?q=query                 # Поиск
PATCH  /user                                 # Обновить
POST   /user/avatar                          # Загрузить аватар
POST   /user/banner                          # Загрузить баннер

# Композиции
POST   /composition/upload                   # Загрузить музыку
GET    /composition                          # Список
GET    /composition/:id                      # Деталь
GET    /composition/my                       # Мои
PATCH  /composition/:id                      # Обновить
POST   /composition/:id/cover                # Обложка

# Плейлисты
POST   /playlist                             # Создать
GET    /playlist                             # Список
GET    /playlist/:id                         # Деталь
POST   /playlist/:id/composition/:cid        # Добавить трек
DELETE /playlist/:id/composition/:cid        # Удалить трек

# Комнаты
POST   /rooms                                # Создать
GET    /rooms                                # Список
GET    /rooms/:id                            # Деталь
PATCH  /rooms/:id/playback                   # Управление воспроизведением
POST   /rooms/:id/members/:uid               # Добавить члена

# Друзья
POST   /friends                              # Добавить
GET    /friends                              # Список
DELETE /friends/:id                          # Удалить

# Сообщения
POST   /messages                             # Отправить
GET    /messages/room/:id                    # История

# История
POST   /playback-history                     # Логировать
GET    /playback-history                     # История
GET    /playback-history/top-played          # Топ
```

Полная документация: [API_EXAMPLES.md](./API_EXAMPLES.md)

## 📊 Примеры использования

### Создание плейлиста

```bash
curl -X POST http://localhost:3000/playlist \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Playlist"}'
```

### Загрузка музыки

```bash
curl -X POST http://localhost:3000/composition/upload \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@song.mp3" \
  -F 'createCompositionDto={"name":"Song"};type=application/json'
```

### Создание комнаты

```bash
curl -X POST http://localhost:3000/rooms \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Party Room"}'
```

Больше примеров в [API_EXAMPLES.md](./API_EXAMPLES.md)

## 🐳 Docker

### Build и запуск

```bash
docker build -t desme-audio .
docker run -p 3000:3000 --env-file .env desme-audio
```

### Docker Compose (с БД и Redis)

```bash
docker-compose up --build
```

## 📝 Лицензия

UNLICENSED

## 🤝 Contributing

Приветствуются pull requests и issues!

## 📞 Поддержка

Вопросы? Создавайте issues на GitHub.

---

**Развлекайтесь с музыкой! 🎵**

$ yarn install

````

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
````

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
