<template>
  <div class="websocket-connection">
    <div class="connection-header">
      <h3>WebSocket 连接</h3>
      <div :class="['status-indicator', statusClass]">
        {{ connectionStatus }}
      </div>
    </div>
    
    <div class="connection-form">
      <div class="form-group">
        <label for="ws-url">WebSocket URL:</label>
        <div class="input-group">
          <input
            id="ws-url"
            v-model="wsUrl"
            type="text"
            placeholder="ws://localhost:8080"
            class="form-input"
            :disabled="isConnected"
            @keyup.enter="connect"
          />
          <button
            v-if="!isConnected"
            @click="connect"
            class="btn btn-primary"
            :disabled="!wsUrl.trim()"
          >
            连接
          </button>
          <button
            v-else
            @click="disconnect"
            class="btn btn-danger"
          >
            断开
          </button>
        </div>
      </div>
      
      <!-- 预设连接选项 -->
      <div class="preset-connections">
        <label>快速连接:</label>
        <div class="preset-buttons">
          <button
            v-for="preset in presetUrls"
            :key="preset.name"
            @click="selectPreset(preset.url)"
            class="btn btn-outline"
            :disabled="isConnected"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>
      
      <!-- 连接信息 -->
      <div v-if="isConnected" class="connection-info">
        <div class="info-item">
          <strong>已连接到:</strong> {{ wsUrl }}
        </div>
        <div class="info-item">
          <strong>连接时间:</strong> {{ formatConnectionTime() }}
        </div>
      </div>
      
      <!-- 连接历史 -->
      <div class="connection-history">
        <label>连接历史:</label>
        <select
          v-model="selectedHistory"
          @change="selectFromHistory"
          class="form-select"
          :disabled="isConnected"
        >
          <option value="">选择历史连接</option>
          <option
            v-for="url in connectionHistory"
            :key="url"
            :value="url"
          >
            {{ url }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps<{
  isConnected: boolean
  connectionStatus: string
}>()

// Emits
const emit = defineEmits<{
  connect: [url: string]
  disconnect: []
}>()

// 响应式数据
const wsUrl = ref('ws://localhost:8080')
const selectedHistory = ref('')
const connectionTime = ref<Date | null>(null)
const connectionHistory = ref<string[]>([])

// 预设连接
const presetUrls = [
  { name: '本地测试', url: 'ws://localhost:8080' },
  { name: 'Mock 服务', url: 'ws://localhost:2333' },
  { name: 'Echo 服务', url: 'wss://echo.websocket.org' }
]

// 计算属性
const statusClass = computed(() => {
  switch (props.connectionStatus) {
    case '已连接':
      return 'connected'
    case '已断开':
      return 'disconnected'
    case '连接中':
      return 'connecting'
    case '连接错误':
    case '连接失败':
      return 'error'
    default:
      return 'disconnected'
  }
})

// 方法
const connect = () => {
  if (wsUrl.value.trim()) {
    emit('connect', wsUrl.value.trim())
    connectionTime.value = new Date()
    addToHistory(wsUrl.value.trim())
  }
}

const disconnect = () => {
  emit('disconnect')
  connectionTime.value = null
}

const selectPreset = (url: string) => {
  wsUrl.value = url
}

const selectFromHistory = () => {
  if (selectedHistory.value) {
    wsUrl.value = selectedHistory.value
    selectedHistory.value = ''
  }
}

const addToHistory = (url: string) => {
  if (!connectionHistory.value.includes(url)) {
    connectionHistory.value.unshift(url)
    // 只保留最近10个连接
    if (connectionHistory.value.length > 10) {
      connectionHistory.value = connectionHistory.value.slice(0, 10)
    }
    saveHistory()
  }
}

const loadHistory = () => {
  try {
    const saved = localStorage.getItem('ws-connection-history')
    if (saved) {
      connectionHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载连接历史失败:', error)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem('ws-connection-history', JSON.stringify(connectionHistory.value))
  } catch (error) {
    console.error('保存连接历史失败:', error)
  }
}

const formatConnectionTime = () => {
  if (!connectionTime.value) return ''
  return connectionTime.value.toLocaleString('zh-CN')
}

// 组件挂载时加载历史
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.websocket-connection {
  background: white;
  border-radius: 4px;
  padding: 1rem;
}

.connection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.connection-header h3 {
  margin: 0;
  color: #333;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-indicator.connected {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-indicator.disconnected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-indicator.connecting {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-indicator.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.connection-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #555;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.form-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.preset-connections {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.connection-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
}

.info-item {
  margin-bottom: 0.5rem;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.connection-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
}
</style>

