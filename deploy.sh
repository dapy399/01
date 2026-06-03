#!/bin/bash

# AI医疗RAG项目 - 手动部署脚本（无Docker版）
# 适用于阿里云ECS Ubuntu 22.04

set -e

echo "=========================================="
echo "  AI医疗RAG项目 - 手动部署"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 目录配置
PROJECT_DIR="/opt/ai-medical-rag"
BACKEND_DIR="$PROJECT_DIR/nest-serve"
FRONTEND_DIR="/var/www/ai-medical"

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${YELLOW}[检查环境]${NC}"

# 检查 Node.js
if ! command_exists node; then
    echo -e "${RED}错误：Node.js 未安装${NC}"
    echo "正在安装 Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查 pnpm
if ! command_exists pnpm; then
    echo -e "${YELLOW}正在安装 pnpm...${NC}"
    npm install -g pnpm
fi

# 检查 PM2
if ! command_exists pm2; then
    echo -e "${YELLOW}正在安装 PM2...${NC}"
    npm install -g pm2
fi

# 检查 Nginx
if ! command_exists nginx; then
    echo -e "${RED}错误：Nginx 未安装${NC}"
    echo "请执行：sudo apt-get install -y nginx"
    exit 1
fi

echo -e "${GREEN}环境检查通过！${NC}"
echo ""

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误：项目目录不存在${NC}"
    echo "请先克隆代码："
    echo "  sudo mkdir -p /opt && cd /opt"
    echo "  sudo git clone https://github.com/你的用户名/你的仓库.git ai-medical-rag"
    exit 1
fi

# 检查 .env 文件
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}错误：后端 .env 文件不存在${NC}"
    echo "请创建：$BACKEND_DIR/.env"
    exit 1
fi

echo -e "${YELLOW}[1/5] 拉取最新代码...${NC}"
cd $PROJECT_DIR
git pull origin main

echo ""
echo -e "${YELLOW}[2/5] 部署前端...${NC}"
cd $PROJECT_DIR/project-user
pnpm install
pnpm build

# 确保前端部署目录存在
sudo mkdir -p $FRONTEND_DIR

# 复制构建产物
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/* $FRONTEND_DIR/

echo -e "${GREEN}前端部署完成${NC}"

echo ""
echo -e "${YELLOW}[3/5] 部署后端...${NC}"
cd $BACKEND_DIR
pnpm install
pnpm build

echo -e "${GREEN}后端编译完成${NC}"

echo ""
echo -e "${YELLOW}[4/5] 重启后端服务...${NC}"
if pm2 list | grep -q "ai-medical-backend"; then
    pm2 restart ai-medical-backend
    echo -e "${GREEN}后端服务已重启${NC}"
else
    pm2 start dist/src/main.js --name ai-medical-backend
    echo -e "${GREEN}后端服务已启动${NC}"
fi

# 保存 PM2 配置
pm2 save

echo ""
echo -e "${YELLOW}[5/5] 重启 Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址："
echo "  前端: http://$(curl -s ifconfig.me)"
echo "  后端: http://$(curl -s ifconfig.me):7005"
echo ""
echo "常用命令："
echo "  查看后端日志: pm2 logs ai-medical-backend"
echo "  重启后端: pm2 restart ai-medical-backend"
echo "  停止后端: pm2 stop ai-medical-backend"
echo "  查看状态: pm2 status"
echo ""
