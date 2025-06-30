<template>
  <div id="app">
    <header class="app-header">
      <h1>WebSocket 测试平台</h1>
    </header>
    
    <main class="app-main">
      <div class="sidebar">
        <ProjectManager
          :projects="projects"
          :currentProject="currentProject"
          @create-project="createProject"
          @select-project="selectProject"
          @delete-project="deleteProject"
        />
      </div>
      
      <div class="content">
        <div class="connection-panel">
          <WebSocketConnection
            :isConnected="isConnected"
            :connectionStatus="connectionStatus"
            @connect="handleConnect"
            @disconnect="handleDisconnect"
          />
        </div>
        
        <div class="message-panel">
          <MessageWindow
            :messages="currentMessages"
            :isConnected="isConnected"
            @send-message="sendMessage"
            @edit-message="editMessage"
            @replay-message="replayMessage"
          />
        </div>
        
        <div class="records-panel">
          <MessageRecords
            :project="currentProject"
            @export-project="exportProject"
          />
        </div>
      </div>
    </main>
    
    <!-- 消息编辑器模态框 -->
    <MessageEditor
      v-if="showEditor"
      :message="editingMessage"
      @save="saveEditedMessage"
      @close="closeEditor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import ProjectManager from './components/ProjectManager.vue'
import WebSocketConnection from './components/WebSocketConnection.vue'
import MessageWindow from './components/MessageWindow.vue'
import MessageRecords from './components/MessageRecords.vue'
import MessageEditor from './components/MessageEditor.vue'

// 接口定义
interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  messages: Message[]
}

interface Message {
  id: string
  direction: 'sent' | 'received'
  content: string
  timestamp: string
}

// 响应式数据
const projects = ref<Project[]>([])
const currentProject = ref<Project | null>(null)
const isConnected = ref(false)
const connectionStatus = ref('已断开')
const websocket = ref<WebSocket | null>(null)
const currentMessages = ref<Message[]>([])
const showEditor = ref(false)
const editingMessage = ref<Message | null>(null)

// API 配置
const API_BASE = 'http://localhost:3000/api'

// 计算属性
const currentProjectMessages = computed(() => {
  return currentProject.value?.messages || []
})

// WebSocket 连接处理
const handleConnect = async (url: string) => {
  try {
    websocket.value = new WebSocket(url)
    
    websocket.value.onopen = () => {
      isConnected.value = true
      connectionStatus.value = '已连接'
      console.log('WebSocket 连接成功')
    }
    
    websocket.value.onmessage = (event) => {
      const message: Message = {
        id: Date.now().toString(),
        direction: 'received',
        content: event.data,
        timestamp: new Date().toISOString()
      }
      
      currentMessages.value.push(message)
      
      // 如果有当前项目，保存消息到项目
      if (currentProject.value) {
        addMessageToProject(currentProject.value.id, message)
      }
    }
    
    websocket.value.onclose = () => {
      isConnected.value = false
      connectionStatus.value = '已断开'
      console.log('WebSocket 连接关闭')
    }
    
    websocket.value.onerror = (error) => {
      isConnected.value = false
      connectionStatus.value = '连接错误'
      console.error('WebSocket 错误:', error)
    }
  } catch (error) {
    console.error('连接失败:', error)
    connectionStatus.value = '连接失败'
  }
}

const handleDisconnect = () => {
  if (websocket.value) {
    websocket.value.close()
    websocket.value = null
  }
  isConnected.value = false
  connectionStatus.value = '已断开'
}

// 发送消息
const sendMessage = (content: string) => {
  if (websocket.value && isConnected.value) {
    websocket.value.send(content)
    
    const message: Message = {
      id: Date.now().toString(),
      direction: 'sent',
      content: content,
      timestamp: new Date().toISOString()
    }
    
    currentMessages.value.push(message)
    
    // 如果有当前项目，保存消息到项目
    if (currentProject.value) {
      addMessageToProject(currentProject.value.id, message)
    }
  }
}

// 项目管理
const loadProjects = async () => {
  try {
    const response = await fetch(`${API_BASE}/projects`)
    projects.value = await response.json()
  } catch (error) {
    console.error('加载项目失败:', error)
  }
}

const createProject = async (name: string, description: string) => {
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    })
    
    const newProject = await response.json()
    projects.value.push(newProject)
    currentProject.value = newProject
    currentMessages.value = []
  } catch (error) {
    console.error('创建项目失败:', error)
  }
}

const selectProject = (project: Project) => {
  currentProject.value = project
  currentMessages.value = [...project.messages]
}

const deleteProject = async (projectId: string) => {
  try {
    await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE'
    })
    
    projects.value = projects.value.filter(p => p.id !== projectId)
    
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
      currentMessages.value = []
    }
  } catch (error) {
    console.error('删除项目失败:', error)
  }
}

// 添加消息到项目
const addMessageToProject = async (projectId: string, message: Message) => {
  try {
    await fetch(`${API_BASE}/projects/${projectId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })
    
    // 更新本地项目数据
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.messages.push(message)
    }
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

// 消息编辑
const editMessage = (message: Message) => {
  editingMessage.value = { ...message }
  showEditor.value = true
}

const saveEditedMessage = (editedMessage: Message) => {
  // 重新发送编辑后的消息
  sendMessage(editedMessage.content)
  closeEditor()
}

const closeEditor = () => {
  showEditor.value = false
  editingMessage.value = null
}

// Mock 回放
const replayMessage = async (message: Message) => {
  try {
    // 连接到 Mock WebSocket 服务器
    const mockWs = new WebSocket('ws://localhost:2333')
    
    mockWs.onopen = () => {
      const mockData = {
        projectId: currentProject.value?.id,
        content: message.content
      }
      mockWs.send(JSON.stringify(mockData))
    }
    
    mockWs.onmessage = (event) => {
      const response: Message = {
        id: Date.now().toString(),
        direction: 'received',
        content: event.data,
        timestamp: new Date().toISOString()
      }
      
      currentMessages.value.push(response)
      mockWs.close()
    }
  } catch (error) {
    console.error('Mock 回放失败:', error)
  }
}

// 导出项目
const exportProject = async (project: Project) => {
  try {
    const response = await fetch(`${API_BASE}/projects/${project.id}/export`)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `${project.name}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('导出项目失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.connection-panel {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 1rem;
}

.message-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.records-panel {
  height: 200px;
  background: #f9f9f9;
  border-top: 1px solid #ddd;
  overflow-y: auto;
}
</style>

