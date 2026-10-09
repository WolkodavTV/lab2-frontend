# 1. Базовий образ
FROM node:20-alpine

# 2. Робоча директорія
WORKDIR /app

# 3. Встановлення залежностей
COPY package*.json ./
RUN npm install

# 4. Копіювання коду
COPY . .

# 5. Адреса бекенду під час збірки (вказуємо локальний бекенд або твій Render URL)
ENV NEXT_PUBLIC_API_URL=http://localhost:3000

# 6. Збірка оптимізованого Next.js проєкту
RUN npm run build

# 7. Порт застосунку
EXPOSE 3000

# 8. Запуск продакшн-сервера Next.js
CMD ["npm", "run", "start"]