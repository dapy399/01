# 后端 Dockerfile
# 基于 Node 22 镜像
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 编译 TypeScript
RUN pnpm build

# 生产环境镜像
FROM node:22-alpine AS production

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制编译后的代码
COPY --from=builder /app/dist ./dist

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 7005

# 启动命令
CMD ["node", "dist/main.js"]
