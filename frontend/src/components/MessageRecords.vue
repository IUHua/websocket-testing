<template>
  <div class="message-records">
    <div class="records-header">
      <h3>项目记录</h3>
      <div class="records-actions" v-if="project">
        <button
          @click="exportProject"
          class="btn btn-outline btn-sm"
          title="导出项目"
        >
          导出
        </button>
        <button
          @click="toggleExpanded"
          class="btn btn-outline btn-sm"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </button>
      </div>
    </div>
    
    <div v-if="!project" class="no-project">
      <p>请选择一个项目查看记录</p>
    </div>
    
    <div v-else class="records-content">
      <!-- 项目信息 -->
      <div class="project-summary">
        <div class="summary-item">
          <strong>项目名称:</strong> {{ project.name }}
        </div>
        <div class="summary-item">
          <strong>创建时间:</strong> {{ formatDate(project.createdAt) }}
        </div>
        <div class="summary-item">
          <strong>消息总数:</strong> {{ project.messages.length }}
        </div>
        <div class="summary-item">
          <strong>发送消息:</strong> {{ sentCount }}
        </div>
        <div class="summary-item">
          <strong>接收消息:</strong> {{ receivedCount }}
        </div>
      </div>
      
      <!-- 消息记录列表 -->
      <div v-if="isExpanded" class="records-list">
        <div class="list-header">
          <div class="filter-controls">
            <select v-model="filterType" class="filter-select">
              <option value="all">全部消息</option>
              <option value="sent">仅发送</option>
              <option value="received">仅接收</option>
            </select>
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索消息内容..."
              class="search-input"
            />
          </div>
        </div>
        
        <div class="records-scroll">
          <div
            v-for="message in filteredMessages"
            :key="message.id"
            :class="['record-item', message.direction]"
          >
            <div class="record-header">
              <span :class="['record-type', message.direction]">
                {{ message.direction === 'sent' ? '发送' : '接收' }}
              </span>
              <span class="record-time">
                {{ formatTime(message.timestamp) }}
              </span>
            </div>
            <div class="record-content">
              <pre>{{ truncateContent(message.content) }}</pre>
            </div>
            <div class="record-actions">
              <button
                @click="viewFullContent(message)"
                class="btn btn-link btn-xs"
              >
                查看完整
              </button>
              <button
                @click="copyContent(message.content)"
                class="btn btn-link btn-xs"
              >
                复制
              </button>
            </div>
          </div>
          
          <div v-if="filteredMessages.length === 0" class="no-records">
            <p v-if="project.messages.length === 0">
              暂无消息记录
            </p>
            <p v-else>
              没有找到匹配的消息
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 消息详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>消息详情</h4>
          <button @click="closeDetailModal" class="btn btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-info">
            <div><strong>方向:</strong> {{ selectedMessage?.direction === 'sent' ? '发送' : '接收' }}</div>
            <div><strong>时间:</strong> {{ formatFullTime(selectedMessage?.timestamp) }}</div>
            <div><strong>内容长度:</strong> {{ selectedMessage?.content.length }} 字符</div>
          </div>
          <div class="detail-content">
            <pre>{{ selectedMessage?.content }}</pre>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="copyContent(selectedMessage?.content || '')"
            class="btn btn-outline"
          >
            复制内容
          </button>
          <button @click="closeDetailModal" class="btn btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Message {
  id: string
  direction: 'sent' | 'received'
  content: string
  timestamp: string
}

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  messages: Message[]
}

// Props
const props = defineProps<{
  project: Project | null
}>()

// Emits
const emit = defineEmits<{
  'export-project': [project: Project]
}>()

// 响应式数据
const isExpanded = ref(true)
const filterType = ref<'all' | 'sent' | 'received'>('all')
const searchText = ref('')
const showDetailModal = ref(false)
const selectedMessage = ref<Message | null>(null)

// 计算属性
const sentCount = computed(() => {
  return props.project?.messages.filter(m => m.direction === 'sent').length || 0
})

const receivedCount = computed(() => {
  return props.project?.messages.filter(m => m.direction === 'received').length || 0
})

const filteredMessages = computed(() => {
  if (!props.project) return []
  
  let messages = props.project.messages
  
  // 按类型过滤
  if (filterType.value !== 'all') {
    messages = messages.filter(m => m.direction === filterType.value)
  }
  
  // 按内容搜索
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    messages = messages.filter(m => 
      m.content.toLowerCase().includes(search)
    )
  }
  
  // 按时间倒序排列
  return messages.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const exportProject = () => {
  if (props.project) {
    emit('export-project', props.project)
  }
}

const viewFullContent = (message: Message) => {
  selectedMessage.value = message
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedMessage.value = null
}

const copyContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    // 可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const truncateContent = (content: string, maxLength: number = 100) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const formatFullTime = (timestamp?: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<style scoped>
.message-records {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
}

.records-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.records-actions {
  display: flex;
  gap: 0.5rem;
}

.no-project {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.records-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
}

.summary-item {
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.records-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.search-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.records-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.record-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
}

.record-item.sent {
  border-left: 3px solid #007bff;
}

.record-item.received {
  border-left: 3px solid #28a745;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 12px;
}

.record-type {
  font-weight: bold;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  text-transform: uppercase;
}

.record-type.sent {
  background: #e3f2fd;
  color: #1976d2;
}

.record-type.received {
  background: #e8f5e8;
  color: #388e3c;
}

.record-time {
  color: #999;
}

.record-content {
  margin-bottom: 0.5rem;
}

.record-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.3;
  color: #333;
}

.record-actions {
  display: flex;
  gap: 0.5rem;
}

.no-records {
  text-align: center;
  color: #999;
  padding: 2rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.modal-header h4 {
  margin: 0;
  color: #333;
}

.modal-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.detail-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 14px;
}

.detail-info > div {
  margin-bottom: 0.5rem;
}

.detail-info > div:last-child {
  margin-bottom: 0;
}

.detail-content {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background: #f8f9fa;
}

.detail-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
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

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-link {
  background: transparent;
  color: #007bff;
  border: none;
  text-decoration: underline;
}

.btn-link:hover {
  color: #0056b3;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
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

