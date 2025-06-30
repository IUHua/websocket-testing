<template>
  <div class="message-window">
    <div class="message-header">
      <h3>消息窗口</h3>
      <div class="message-stats">
        <span>消息数: {{ messages.length }}</span>
        <button @click="clearMessages" class="btn btn-outline btn-sm">
          清空
        </button>
      </div>
    </div>
    
    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', message.direction]"
      >
        <div class="message-header-info">
          <span class="message-direction">
            {{ message.direction === 'sent' ? '发送' : '接收' }}
          </span>
          <span class="message-time">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
        <div class="message-content" @click="selectMessage(message)">
          <pre>{{ message.content }}</pre>
        </div>
        <div class="message-actions">
          <button
            @click="editMessage(message)"
            class="btn btn-outline btn-xs"
            title="编辑"
          >
            编辑
          </button>
          <button
            @click="copyMessage(message)"
            class="btn btn-outline btn-xs"
            title="复制"
          >
            复制
          </button>
          <button
            v-if="message.direction === 'sent'"
            @click="replayMessage(message)"
            class="btn btn-outline btn-xs"
            title="重放"
          >
            重放
          </button>
        </div>
      </div>
      
      <div v-if="messages.length === 0" class="empty-state">
        <p>暂无消息</p>
        <p>连接 WebSocket 后开始通信</p>
      </div>
    </div>
    
    <!-- 消息输入区 -->
    <div class="message-input">
      <div class="input-header">
        <label>发送消息:</label>
        <div class="input-options">
          <label class="checkbox-label">
            <input
              v-model="autoFormat"
              type="checkbox"
            />
            自动格式化 JSON
          </label>
          <select v-model="messageType" class="message-type-select">
            <option value="text">文本</option>
            <option value="json">JSON</option>
            <option value="binary">二进制</option>
          </select>
        </div>
      </div>
      
      <div class="input-area">
        <textarea
          v-model="newMessage"
          placeholder="输入要发送的消息..."
          class="message-textarea"
          :disabled="!isConnected"
          @keydown.ctrl.enter="sendMessage"
          @keydown.meta.enter="sendMessage"
        ></textarea>
        <div class="input-actions">
          <button
            @click="formatJson"
            class="btn btn-outline btn-sm"
            :disabled="!newMessage.trim()"
          >
            格式化
          </button>
          <button
            @click="clearInput"
            class="btn btn-outline btn-sm"
            :disabled="!newMessage.trim()"
          >
            清空
          </button>
          <button
            @click="sendMessage"
            class="btn btn-primary"
            :disabled="!isConnected || !newMessage.trim()"
          >
            发送 (Ctrl+Enter)
          </button>
        </div>
      </div>
      
      <!-- 快速消息模板 -->
      <div class="quick-templates">
        <label>快速模板:</label>
        <div class="template-buttons">
          <button
            v-for="template in messageTemplates"
            :key="template.name"
            @click="useTemplate(template.content)"
            class="btn btn-template"
            :disabled="!isConnected"
          >
            {{ template.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

interface Message {
  id: string
  direction: 'sent' | 'received'
  content: string
  timestamp: string
}

// Props
const props = defineProps<{
  messages: Message[]
  isConnected: boolean
}>()

// Emits
const emit = defineEmits<{
  'send-message': [content: string]
  'edit-message': [message: Message]
  'replay-message': [message: Message]
}>()

// 响应式数据
const messageListRef = ref<HTMLElement>()
const newMessage = ref('')
const messageType = ref('text')
const autoFormat = ref(true)

// 消息模板
const messageTemplates = [
  { name: 'Ping', content: '{"type": "ping"}' },
  { name: 'Echo', content: '{"type": "echo", "data": "Hello World"}' },
  { name: '心跳', content: '{"type": "heartbeat", "timestamp": ' + Date.now() + '}' },
  { name: '状态查询', content: '{"type": "status", "action": "query"}' }
]

// 方法
const sendMessage = () => {
  if (newMessage.value.trim() && props.isConnected) {
    let content = newMessage.value.trim()
    
    // 自动格式化 JSON
    if (autoFormat.value && messageType.value === 'json') {
      try {
        const parsed = JSON.parse(content)
        content = JSON.stringify(parsed, null, 2)
      } catch (error) {
        // 如果不是有效的 JSON，保持原样
      }
    }
    
    emit('send-message', content)
    newMessage.value = ''
  }
}

const editMessage = (message: Message) => {
  emit('edit-message', message)
}

const replayMessage = (message: Message) => {
  emit('replay-message', message)
}

const copyMessage = async (message: Message) => {
  try {
    await navigator.clipboard.writeText(message.content)
    // 可以添加一个提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const selectMessage = (message: Message) => {
  newMessage.value = message.content
}

const clearMessages = () => {
  if (confirm('确定要清空所有消息吗？')) {
    // 这里可以发出清空事件，或者由父组件处理
  }
}

const clearInput = () => {
  newMessage.value = ''
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(newMessage.value)
    newMessage.value = JSON.stringify(parsed, null, 2)
  } catch (error) {
    alert('无效的 JSON 格式')
  }
}

const useTemplate = (template: string) => {
  newMessage.value = template
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(() => props.messages.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
.message-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.message-header h3 {
  margin: 0;
  color: #333;
}

.message-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 14px;
  color: #666;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.message-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
  position: relative;
}

.message-item.sent {
  border-left: 4px solid #007bff;
}

.message-item.received {
  border-left: 4px solid #28a745;
}

.message-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 12px;
}

.message-direction {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.message-item.sent .message-direction {
  background: #e3f2fd;
  color: #1976d2;
}

.message-item.received .message-direction {
  background: #e8f5e8;
  color: #388e3c;
}

.message-time {
  color: #999;
}

.message-content {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-content:hover {
  background: #f8f9fa;
}

.message-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.empty-state p {
  margin: 0.5rem 0;
}

.message-input {
  border-top: 1px solid #ddd;
  padding: 1rem;
  background: white;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.input-header label {
  font-weight: bold;
  color: #555;
}

.input-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.message-type-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.input-area {
  margin-bottom: 1rem;
}

.message-textarea {
  width: 100%;
  height: 100px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.message-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-textarea:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.quick-templates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-templates label {
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.template-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.btn-template {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 0.25rem 0.5rem;
  font-size: 12px;
}

.btn-template:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
}

.btn-xs {
  padding: 0.125rem 0.25rem;
  font-size: 11px;
}
</style>

