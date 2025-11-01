# 1. Base image node.js version 22-alpine
FROM node:22-alpine

# 2. Set working directory inside the container (tạo thư mục làm việc trong container)
WORKDIR /app

# 3. Copy the rest of the application code (để cache layer npm install)
COPY package*.json ./

# 4. Cài đặt các gói phụ thuộc
RUN npm install --omit=dev

# 5. Copy toàn bộ source code vào trong container
COPY . .

# 7. Thiết lập biến môi trường
ENV NODE_ENV=production

# 8. Lệnh khởi chạy server
CMD ["node", "server.js"]