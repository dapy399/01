# AI医疗RAG项目 - 部署文档（无Docker版）

## 服务器信息

- **IP**: 121.43.149.193
- **系统**: Ubuntu 22.04 LTS
- **配置**: 2核4G

---

## 一、服务器初始化（首次部署）

### 1. 连接服务器

```bash
ssh root@121.43.149.193
```

### 2. 安装基础环境

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 安装基础工具
sudo apt-get install -y git curl nginx

# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # v22.x.x
npm -v   # 10.x.x

# 安装 pnpm
npm install -g pnpm
pnpm -v

# 安装 PM2（进程管理器）
npm install -g pm2
pm2 -v
```

### 3. 安装 MongoDB

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 安装
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动并设置开机自启
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
sudo systemctl status mongod
```

### 4. 安装 Redis

```bash
sudo apt-get install -y redis-server

# 启动并设置开机自启
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 验证
redis-cli ping  # 返回 PONG
```

### 5. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx/ai-medical.conf /etc/nginx/sites-available/ai-medical

# 创建软链接
sudo ln -sf /etc/nginx/sites-available/ai-medical /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. 创建项目目录

```bash
# 创建目录
sudo mkdir -p /opt/ai-medical-rag
sudo mkdir -p /var/www/ai-medical

# 设置权限
sudo chown -R $USER:$USER /opt/ai-medical-rag
sudo chown -R $USER:$USER /var/www/ai-medical

# 克隆代码
cd /opt
git clone https://github.com/你的用户名/你的仓库.git ai-medical-rag
```

### 7. 配置后端环境变量

```bash
cd /opt/ai-medical-rag/nest-serve
cp .env.example .env
nano .env
```

**填写以下配置：**

```env
# 数据库地址
MONGODB_URI=mongodb://127.0.0.1:27017/nest_server_db

# 密码加密密钥
PASSWORD_KEY=your-random-key

# JWT密钥
JWT_SECRET=your-jwt-secret

# 向量数据库
MILVUS_ADDRESS=https://your-milvus-address.cloud.zilliz.com
MILVUS_TOKEN=your-milvus-token

# 通义千问API
TONGYI_AKI_KEY=sk-your-tongyi-key

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Tavily搜索
TAVILY_API_KEY=tvly-your-tavily-key

# 图片域名
IMAGE_BASE_URL_local=http://121.43.149.193:7005/open-image
```

### 8. 首次部署

```bash
cd /opt/ai-medical-rag
chmod +x deploy.sh
./deploy.sh
```

---

## 二、GitHub Actions CI/CD 配置

### 1. 配置 GitHub Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 |
|-------------|------|
| `ECS_HOST` | 服务器IP：`121.43.149.193` |
| `ECS_USER` | SSH用户名：`root` |
| `ECS_PRIVATE_KEY` | SSH私钥内容 |

### 2. 配置服务器SSH密钥

```bash
# 在服务器上生成密钥（如果还没有）
ssh root@121.43.149.193
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# 查看私钥（复制这个内容到 GitHub Secrets 的 ECS_PRIVATE_KEY）
cat ~/.ssh/github_actions
```

**注意**：GitHub Actions 使用私钥连接服务器，所以需要把**私钥**内容复制到 GitHub Secrets。

### 3. 配置服务器接受GitHub Actions连接

```bash
# 在服务器上
ssh root@121.43.149.193

# 确保 .ssh 目录权限正确
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 如果使用新的密钥对，需要把公钥加到 authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

### 4. 触发自动部署

```bash
# 本地提交代码后自动触发
git add .
git commit -m "更新功能"
git push origin main
```

然后到 GitHub 仓库 → Actions 标签页查看部署状态。

---

## 三、手动部署

如果不想用CI/CD，可以直接在服务器上执行：

```bash
ssh root@121.43.149.193
cd /opt/ai-medical-rag

# 拉取最新代码
git pull origin main

# 执行部署脚本
./deploy.sh
```

---

## 四、常用命令

```bash
# 查看服务状态
pm2 status

# 查看后端日志
pm2 logs ai-medical-backend

# 重启后端
pm2 restart ai-medical-backend

# 停止后端
pm2 stop ai-medical-backend

# 查看 Nginx 状态
sudo systemctl status nginx

# 重启 Nginx
sudo systemctl reload nginx

# 查看 MongoDB 状态
sudo systemctl status mongod

# 查看 Redis 状态
sudo systemctl status redis-server

# 查看端口占用
sudo netstat -tlnp
```

---

## 五、访问地址

部署完成后：

| 服务 | 地址 |
|------|------|
| **前端页面** | http://121.43.149.193 |
| **后端API** | http://121.43.149.193:7005 |
| MongoDB | 127.0.0.1:27017（仅本机）|
| Redis | 127.0.0.1:6379（仅本机）|

---

## 六、故障排查

### 1. 后端启动失败

```bash
# 查看 PM2 日志
pm2 logs ai-medical-backend

# 检查 .env 配置
cat /opt/ai-medical-rag/nest-serve/.env

# 手动运行看错误
cd /opt/ai-medical-rag/nest-serve
node dist/main.js
```

### 2. Nginx 403 错误

```bash
# 检查目录权限
ls -la /var/www/ai-medical

# 修复权限
sudo chown -R www-data:www-data /var/www/ai-medical
```

### 3. MongoDB 连接失败

```bash
# 检查 MongoDB 是否运行
sudo systemctl status mongod

# 检查连接
mongosh --eval "db.adminCommand('ping')"
```

### 4. 端口被占用

```bash
# 查看 7005 端口
sudo lsof -i :7005

# 结束进程
sudo kill -9 <PID>
```

---

## 七、安全建议

1. **配置防火墙**：只开放 80、443、7005 端口
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 7005
   sudo ufw enable
   ```

2. **启用HTTPS**：使用 Let's Encrypt 配置 SSL
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **定期备份 MongoDB**
   ```bash
   mongodump --out /backup/$(date +%Y%m%d)
   ```

4. **配置 MongoDB 和 Redis 密码**（生产环境必须）
