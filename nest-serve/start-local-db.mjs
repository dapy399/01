import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. 启动 MongoDB (内存版)
console.log('[MongoDB] 正在启动内存版 MongoDB...');
const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbName: 'nest_server_db',
  },
  auth: {
    enable: true,
    extraUsers: [
      {
        createUser: 'user',
        pwd: 'user123',
        roles: [{ role: 'readWrite', db: 'nest_server_db' }],
        database: 'nest_server_db',
      },
    ],
  },
});

const mongoUri = mongod.getUri();
console.log('[MongoDB] 已启动:', mongoUri);

// 2. 启动 Redis
const redisPath = join(__dirname, 'tools', 'Redis-x64-3.0.504', 'redis-server.exe');
console.log('[Redis] 正在启动 Redis...');
const redis = spawn(redisPath, ['--port', '6379'], {
  stdio: 'inherit',
  detached: false,
});

redis.on('error', (err) => {
  console.error('[Redis] 启动失败:', err.message);
  console.log('[提示] Redis 未找到，请确保 tools/Redis-x64-3.0.504/redis-server.exe 存在');
});

// 保持运行
console.log('\n========================================');
console.log('本地数据库已启动:');
console.log('  MongoDB: mongodb://user:user123@127.0.0.1:27017/nest_server_db?authSource=admin');
console.log('  Redis: 127.0.0.1:6379');
console.log('========================================\n');
console.log('按 Ctrl+C 停止所有服务');

process.on('SIGINT', async () => {
  console.log('\n正在停止服务...');
  redis.kill();
  await mongod.stop();
  process.exit(0);
});
