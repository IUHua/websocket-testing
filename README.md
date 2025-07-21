# WebSocket 桌面测试工具

这是一个基于 Electron 和 Node.js 的 WebSocket 桌面测试工具，提供了一个完整的 WebSocket 测试和调试环境。它包含一个独立的后端服务和一个功能丰富的桌面客户端。

## 🚀 主要功能

-   **完整的桌面客户端**: 使用 Electron 和 Vue 3 构建，提供原生桌面体验。
-   **实时 WebSocket 通信**: 支持连接到任何 WebSocket 服务器，实时发送和接收消息。
-   **项目管理**: 按项目组织和保存 WebSocket 连接和消息历史。
-   **消息记录与回放**: 自动记录所有通信，并支持基于历史记录的 Mock 回放测试。
-   **RESTful API**: 后端提供用于项目管理的 RESTful API。
-   **跨平台支持**: 可在 Windows、macOS 和 Linux 上运行。

## 📁 项目结构

```
websocket-testing/
├── backend/                 # 后端服务 (Node.js + Express + WebSocket)
│   ├── src/
│   │   ├── app.ts           # Express 应用配置
│   │   ├── server.ts        # 服务器启动脚本
│   │   └── ws/
│   │       ├── main.ts      # 主 WebSocket 服务
│   │       └── mock.ts      # Mock WebSocket 服务
│   └── package.json
├── electron-app/            # Electron 桌面应用 (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── main/            # Electron 主进程
│   │   ├── preload/         # Preload 脚本
│   │   └── renderer/        # 渲染进程 (Vue 应用)
│   └── package.json
└── README.md
```

## 🛠️ 安装与运行

### 环境要求

-   Node.js 18+
-   npm 或 pnpm

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端服务将启动在以下端口:

-   **3000**: REST API 服务
-   **8080**: 主 WebSocket 服务器
-   **2333**: Mock WebSocket 服务器

### 2. 启动 Electron 桌面应用

```bash
# 进入 Electron 应用目录
cd electron-app

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

## 🔧 技术栈

-   **后端**:

    -   Node.js
    -   Express.js
    -   ws (WebSocket 库)
    -   TypeScript

-   **桌面应用**:
    -   Electron
    -   Vue 3
    -   TypeScript
    -   Vite
    -   Element Plus (UI 组件库)
    -   Monaco Editor (代码编辑器)

## 📄 许可证

MIT License
