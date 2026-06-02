# CI/CD 配置说明（无Docker版）

## 自动部署流程

```
git push → GitHub Actions → 构建前端 → SSH到服务器 → 拉代码/装依赖/编译 → PM2重启 → SCP前端dist → 重载Nginx
```

## 需要配置的 Secrets

| Secret | 说明 |
|--------|------|
| `ECS_HOST` | 服务器公网IP：`121.43.149.193` |
| `ECS_USER` | SSH用户名：`root` |
| `ECS_PRIVATE_KEY` | SSH私钥内容 |

## 配置步骤

### 1. 服务器准备

```bash
ssh root@121.43.149.193

# 安装基础环境
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx mongodb redis-server

# 安装 pnpm 和 PM2
npm install -g pnpm pm2

# 创建目录
mkdir -p /opt/ai-medical-rag /var/www/ai-medical

# 克隆代码
cd /opt && git clone https://github.com/你的用户名/你的仓库.git ai-medical-rag

# 配置环境变量
cd /opt/ai-medical-rag/nest-serve && cp .env.example .env && nano .env
```

### 2. 配置 Nginx

```bash
sudo cp /opt/ai-medical-rag/nginx/ai-medical.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/ai-medical.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 3. 生成 SSH 密钥

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions      # 私钥 → 复制到 GitHub Secrets
cat ~/.ssh/github_actions.pub  # 公钥 → 加到 authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

### 4. GitHub Secrets 配置

仓库 → Settings → Secrets and variables → Actions → New repository secret

添加3个 Secrets：
- `ECS_HOST`: `121.43.149.193`
- `ECS_USER`: `root`
- `ECS_PRIVATE_KEY`: `-----BEGIN OPENSSH PRIVATE KEY-----...`（私钥全文）

### 5. 触发部署

```bash
git add .
git commit -m "更新功能"
git push origin main
```

然后到 GitHub → Actions 查看部署进度。

## 部署脚本说明

### GitHub Actions 做什么？

1. **检出代码** → 拉取最新代码
2. **构建前端** → 在GitHub Runner上执行 `pnpm build`
3. **SSH部署后端** → 连服务器执行：git pull → pnpm install → pnpm build → pm2 restart
4. **SCP前端文件** → 把 dist/ 目录复制到服务器 `/var/www/ai-medical`
5. **重载Nginx** → `nginx -t && systemctl reload nginx`

### 服务器上有什么？

- **前端**：`/var/www/ai-medical`（Nginx静态目录）
- **后端**：`/opt/ai-medical-rag/nest-serve`（PM2进程管理）
- **MongoDB**：本地运行，端口27017
- **Redis**：本地运行，端口6379
