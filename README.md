# Поздравительная открытка на 8-е марта

Теперь это единое приложение на **Next.js 16** с App Router:

- форма создания открытки на `/`;
- страница просмотра по ссылке на `/cards/[id]`;
- backend внутри `app/api/...`;
- хранение текстов открыток в **Postgres**.

Отдельный NestJS backend и GitHub Pages сценарий удалены.

## Текущий стек

- Next.js 16
- React 19
- react-three-fiber / drei / react-spring
- Node.js 22+
- npm 10+
- Postgres через Vercel/Neon integration

## Что умеет приложение

### UI

- на главной странице есть форма для создания открытки;
- после сохранения пользователь получает shareable-ссылку;
- по ссылке `/cards/[id]` открывается отдельная страница открытки;
- открытка отображается как интерактивная 3D-сцена.

### Backend

Route handlers:

- `POST /api/cards` - создать открытку;
- `GET /api/cards/[id]` - получить открытку по id.

### Хранилище

Используется таблица `cards`:

- `id UUID PRIMARY KEY`
- `text TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

При первом обращении схема создается автоматически.

Также сохранен месячный лимит:

- максимум `1000` открыток в месяц.

## Локальный запуск

### 1. Установить зависимости

```sh
npm install
```

### 2. Настроить переменные окружения

Создайте `.env.local`:

```sh
cp .env.example .env.local
```

Заполните:

```env
DATABASE_URL=postgres://...
```

Если `DATABASE_URL` не задан:

- главная страница откроется;
- форма создания будет отвечать ошибкой;
- страница сохраненной открытки не сможет загрузить данные.

### 3. Запустить dev-сервер

```sh
npm run dev
```

Откройте:

- `http://localhost:3000/` - форма создания;
- `http://localhost:3000/cards/<id>` - просмотр открытки.

## Проверки

```sh
npm run lint
npm run build
```

## Структура проекта

```text
app/
  api/cards/route.ts
  api/cards/[id]/route.ts
  cards/[id]/page.tsx
  layout.tsx
  page.tsx
components/
  card-scene.tsx
  create-card-experience.tsx
lib/
  cards.ts
```

## Развертывание на Vercel

Нужен платный аккаунт Vercel - это подходит для этого проекта.

### Что использовать для базы

Рекомендованный вариант: **Vercel Postgres / Neon integration**.

Практически это означает:

- в Vercel подключается Postgres через Marketplace / Storage integration;
- в проект автоматически попадает `DATABASE_URL`;
- код приложения работает через Neon serverless driver.

Это современный эквивалент сценария "использовать Vercel Postgres".

## Пошаговый деплой на Vercel

### 1. Импортировать репозиторий

В Vercel:

1. `Add New -> Project`
2. Выбрать GitHub-репозиторий
3. Root Directory: `/`
4. Framework Preset: `Next.js`

### 2. Build-настройки

Обычно Vercel подставит их сам, но по факту нужны:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output: стандартный Next.js output

### 3. Подключить Postgres

В Vercel Project Dashboard:

1. Открыть вкладку Storage / Marketplace
2. Выбрать Postgres integration
3. Сейчас это обычно делается через **Neon**
4. Создать новую базу или подключить существующую

После подключения проверьте, что в Environment Variables появился:

- `DATABASE_URL`

Этого достаточно для текущего кода.

### 4. Redeploy

После подключения базы сделайте redeploy проекта.

При первом создании или чтении открытки приложение само создаст таблицу `cards`.

## Как работает прод-сценарий

1. Пользователь открывает `/`
2. Вводит текст открытки
3. Фронтенд отправляет `POST /api/cards`
4. Route handler сохраняет текст в Postgres
5. Пользователь получает ссылку `/cards/<id>`
6. По этой ссылке страница загружает открытку из базы

## Что важно знать про Vercel Postgres в 2026

Исторический пакет `@vercel/postgres` уже устаревает.  
Для новой интеграции правильнее использовать Postgres через Neon-managed/Vercel-managed integration и SDK `@neondatabase/serverless`.

Для пользователя Vercel это по-прежнему тот же сценарий:

- подключаете Postgres в панели Vercel;
- получаете `DATABASE_URL`;
- приложение работает с серверной БД, а не с локальными файлами.

## Замечания по дальнейшему развитию

- можно добавить авторские slug-ссылки поверх UUID;
- можно ограничить частоту создания открыток по IP / rate limit;
- можно добавить шаблоны поздравлений;
- можно сделать Open Graph картинку для красивого шаринга в мессенджерах.
