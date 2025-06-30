<template>
  <div class="project-manager">
    <div class="project-header">
      <h3>项目管理</h3>
      <button @click="showCreateForm = true" class="btn btn-primary">
        新建项目
      </button>
    </div>
    
    <!-- 创建项目表单 -->
    <div v-if="showCreateForm" class="create-form">
      <div class="form-group">
        <label>项目名称:</label>
        <input
          v-model="newProject.name"
          type="text"
          placeholder="输入项目名称"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label>项目描述:</label>
        <textarea
          v-model="newProject.description"
          placeholder="输入项目描述"
          class="form-textarea"
        ></textarea>
      </div>
      <div class="form-actions">
        <button @click="createProject" class="btn btn-success">
          创建
        </button>
        <button @click="cancelCreate" class="btn btn-secondary">
          取消
        </button>
      </div>
    </div>
    
    <!-- 项目列表 -->
    <div class="project-list">
      <div
        v-for="project in projects"
        :key="project.id"
        :class="['project-item', { active: currentProject?.id === project.id }]"
        @click="selectProject(project)"
      >
        <div class="project-info">
          <h4>{{ project.name }}</h4>
          <p>{{ project.description }}</p>
          <small>创建时间: {{ formatDate(project.createdAt) }}</small>
          <small>消息数: {{ project.messages.length }}</small>
        </div>
        <div class="project-actions">
          <button
            @click.stop="deleteProject(project.id)"
            class="btn btn-danger btn-sm"
          >
            删除
          </button>
        </div>
      </div>
      
      <div v-if="projects.length === 0" class="empty-state">
        <p>暂无项目，点击"新建项目"开始</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  messages: any[]
}

// Props
const props = defineProps<{
  projects: Project[]
  currentProject: Project | null
}>()

// Emits
const emit = defineEmits<{
  'create-project': [name: string, description: string]
  'select-project': [project: Project]
  'delete-project': [projectId: string]
}>()

// 响应式数据
const showCreateForm = ref(false)
const newProject = reactive({
  name: '',
  description: ''
})

// 方法
const createProject = () => {
  if (newProject.name.trim()) {
    emit('create-project', newProject.name.trim(), newProject.description.trim())
    cancelCreate()
  }
}

const cancelCreate = () => {
  showCreateForm.value = false
  newProject.name = ''
  newProject.description = ''
}

const selectProject = (project: Project) => {
  emit('select-project', project)
}

const deleteProject = (projectId: string) => {
  if (confirm('确定要删除这个项目吗？')) {
    emit('delete-project', projectId)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.project-manager {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-header h3 {
  margin: 0;
  color: #333;
}

.create-form {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  height: 60px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.project-list {
  flex: 1;
  overflow-y: auto;
}

.project-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-item:hover {
  background: #f0f0f0;
  border-color: #007bff;
}

.project-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.project-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 16px;
}

.project-info p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 14px;
}

.project-info small {
  display: block;
  color: #999;
  font-size: 12px;
  margin-bottom: 0.25rem;
}

.project-actions {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.empty-state p {
  margin: 0;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
}
</style>

