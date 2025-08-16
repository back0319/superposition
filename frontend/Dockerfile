# 개발용 스테이지
FROM node:20 AS development
WORKDIR /app
EXPOSE 3000
CMD ["npm", "start"]

# 빌드 스테이지
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/build ./build
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "build", "-l", "4173"]