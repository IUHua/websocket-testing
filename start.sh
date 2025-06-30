#!/bin/bash

# WebSocket 测试平台启动脚本

echo "🚀 启动 WebSocket 测试平台..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "📦 检查依赖..."

# 检查后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📥 安装后端依赖..."
    cd backend && pnpm install && cd ..
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 安装前端依赖..."
    cd frontend && pnpm install && cd ..
fi

echo "🔧 启动服务..."

# 启动后端服务（后台运行）
echo "🖥️  启动后端服务 (端口 3000, 8080, 2333)..."
cd backend && pnpm run dev &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
sleep 3

# 启动前端服务（后台运行）
echo "🌐 启动前端服务 (端口 5173)..."
cd frontend && pnpm dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端应用: http://localhost:5173"
echo "   后端API:  http://localhost:3000"
echo "   WebSocket: ws://localhost:8080"
echo "   Mock服务: ws://localhost:2333"
echo ""
echo "🛑 停止服务请按 Ctrl+C"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# 保持脚本运行
wait

