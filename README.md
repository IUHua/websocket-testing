# WebSocket 测试平台

一个功能完整的 WebSocket 测试平台，支持前后端通信、项目管理、消息记录和 Mock 回放功能。

## 🚀 功能特性

### 核心功能
- **WebSocket 连接测试** - 支持连接任意 WebSocket 服务器
- **实时消息通信** - 发送和接收消息，支持多种消息格式
- **项目管理** - 创建、选择、删除项目，按项目组织测试会话
- **消息记录** - 完整记录发送和接收的消息，包含时间戳
- **消息编辑与复用** - 编辑历史消息并重新发送
- **Mock 回放功能** - 基于历史记录进行模拟回放测试

### 技术特性
- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Node.js + Express + WebSocket
- **编辑器**: Monaco Editor 集成，支持 JSON/XML 格式化
- **数据持久化**: 本地文件存储，支持项目导出
- **跨域支持**: 完整的 CORS 配置

## 📁 项目结构

```
websocket-test-platform/
├── backend/                 # 后端服务
│   ├── server.js           # 主服务器文件
│   ├── package.json        # 后端依赖配置
│   └── data/               # 数据存储目录
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── App.vue         # 主应用组件
│   │   └── components/     # Vue 组件
│   │       ├── ProjectManager.vue
│   │       ├── WebSocketConnection.vue
│   │       ├── MessageWindow.vue
│   │       ├── MessageRecords.vue
│   │       └── MessageEditor.vue
│   ├── package.json        # 前端依赖配置
│   └── vite.config.ts      # Vite 配置
├── test.html               # 简单测试页面
└── README.md               # 项目说明
```

## 🛠️ 安装与运行

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 后端服务启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm run dev
```

后端服务将启动以下端口：
- **3000**: Express REST API 服务
- **8080**: 主 WebSocket 服务器
- **2333**: Mock WebSocket 服务器

### 前端应用启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

## 🎯 使用指南

### 1. 创建项目
- 点击"新建项目"按钮
- 输入项目名称和描述
- 项目将自动保存到本地

### 2. WebSocket 连接
- 输入 WebSocket URL（如 `ws://localhost:8080`）
- 点击"连接"按钮建立连接
- 支持快速连接预设和连接历史

### 3. 发送消息
- 在消息输入框中输入内容
- 支持文本、JSON、二进制格式
- 可使用快速模板发送常用消息
- 支持 JSON 自动格式化

### 4. 消息管理
- 查看完整的消息收发记录
- 点击消息可复制或编辑
- 支持消息搜索和过滤
- 可导出项目数据为 JSON 文件

### 5. Mock 回放
- 连接到 Mock 服务器 (`ws://localhost:2333`)
- 发送包含 `projectId` 和 `content` 的消息
- 系统将根据历史记录返回对应响应

## 🔧 API 接口

### REST API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/projects` | 获取所有项目 |
| POST | `/api/projects` | 创建新项目 |
| GET | `/api/projects/:id` | 获取特定项目 |
| PUT | `/api/projects/:id` | 更新项目 |
| DELETE | `/api/projects/:id` | 删除项目 |
| POST | `/api/projects/:id/messages` | 添加消息到项目 |
| GET | `/api/projects/:id/export` | 导出项目数据 |
| POST | `/api/mock/:projectId` | 设置 Mock 数据 |
| GET | `/api/mock/:projectId` | 获取 Mock 数据 |

### WebSocket 消息格式

#### 主服务器 (端口 8080)
```json
// Ping 消息
{"type": "ping"}
// 响应: {"type": "pong", "timestamp": 1234567890}

// Echo 消息  
{"type": "echo", "data": "Hello World"}
// 响应: {"type": "echo", "data": "Hello World", "timestamp": 1234567890}
```

#### Mock 服务器 (端口 2333)
```json
// Mock 请求
{"projectId": "项目ID", "content": "消息内容"}
// 响应: 根据历史记录返回对应内容
```

## 🎨 界面预览

平台提供直观的用户界面，包含：
- **左侧边栏**: 项目管理面板
- **顶部区域**: WebSocket 连接控制
- **中央区域**: 消息收发窗口
- **底部区域**: 项目记录浏览器
- **弹窗编辑器**: Monaco Editor 消息编辑

## 🔍 测试验证

项目包含完整的功能测试：
1. ✅ WebSocket 连接建立和断开
2. ✅ 消息发送和接收
3. ✅ Ping/Pong 心跳机制
4. ✅ Echo 回显功能
5. ✅ Mock 服务器响应
6. ✅ 项目数据持久化
7. ✅ REST API 接口调用

## 📝 开发说明

### 技术架构
- **前端**: 采用 Vue 3 Composition API，TypeScript 提供类型安全
- **后端**: Express 提供 REST API，ws 库处理 WebSocket 连接
- **数据存储**: JSON 文件存储，支持项目导入导出
- **编辑器**: Monaco Editor 提供代码编辑功能

### 扩展建议
- 添加用户认证和权限管理
- 支持更多消息格式（Protobuf、MessagePack）
- 集成数据库存储（SQLite、MongoDB）
- 添加消息加密和安全验证
- 支持 WebSocket 子协议
- 添加性能监控和日志记录

## 📄 许可证

MIT License - 可自由使用、修改和分发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

---

**WebSocket 测试平台** - 让 WebSocket 开发和测试变得简单高效！

