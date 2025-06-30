<template>
  <div class="modal-overlay" @click="closeEditor">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h4>编辑消息</h4>
        <button @click="closeEditor" class="btn btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="editor-info">
          <div class="info-item">
            <strong>原始方向:</strong> 
            <span :class="['direction-badge', message?.direction]">
              {{ message?.direction === 'sent' ? '发送' : '接收' }}
            </span>
          </div>
          <div class="info-item">
            <strong>原始时间:</strong> {{ formatTime(message?.timestamp) }}
          </div>
          <div class="info-item">
            <strong>内容长度:</strong> {{ editedContent.length }} 字符
          </div>
        </div>
        
        <div class="editor-controls">
          <div class="control-group">
            <label>编辑模式:</label>
            <select v-model="editorMode" @change="changeEditorMode" class="mode-select">
              <option value="text">纯文本</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          
          <div class="control-group">
            <button
              @click="formatContent"
              class="btn btn-outline btn-sm"
              :disabled="!canFormat"
            >
              格式化
            </button>
            <button
              @click="validateContent"
              class="btn btn-outline btn-sm"
              v-if="editorMode === 'json'"
            >
              验证 JSON
            </button>
            <button
              @click="resetContent"
              class="btn btn-outline btn-sm"
            >
              重置
            </button>
          </div>
        </div>
        
        <!-- Monaco Editor 容器 -->
        <div class="editor-container">
          <div ref="editorRef" class="monaco-editor"></div>
        </div>
        
        <!-- 验证结果 -->
        <div v-if="validationResult" class="validation-result">
          <div :class="['validation-message', validationResult.type]">
            {{ validationResult.message }}
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <label class="checkbox-label">
            <input v-model="saveAsNew" type="checkbox" />
            保存为新项目
          </label>
        </div>
        <div class="footer-right">
          <button @click="closeEditor" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="saveMessage"
            class="btn btn-primary"
            :disabled="!hasChanges"
          >
            {{ saveAsNew ? '保存为新项目' : '保存并发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as monaco from 'monaco-editor'

interface Message {
  id: string
  direction: 'sent' | 'received'
  content: string
  timestamp: string
}

interface ValidationResult {
  type: 'success' | 'error'
  message: string
}

// Props
const props = defineProps<{
  message: Message | null
}>()

// Emits
const emit = defineEmits<{
  save: [message: Message]
  close: []
}>()

// 响应式数据
const editorRef = ref<HTMLElement>()
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor>()
const editedContent = ref('')
const originalContent = ref('')
const editorMode = ref('text')
const saveAsNew = ref(false)
const validationResult = ref<ValidationResult | null>(null)

// 计算属性
const hasChanges = computed(() => {
  return editedContent.value !== originalContent.value
})

const canFormat = computed(() => {
  return ['json', 'xml', 'javascript'].includes(editorMode.value)
})

// 方法
const initializeEditor = () => {
  if (!editorRef.value) return
  
  // 创建 Monaco Editor 实例
  editorInstance.value = monaco.editor.create(editorRef.value, {
    value: editedContent.value,
    language: getMonacoLanguage(editorMode.value),
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    fontSize: 14,
    fontFamily: 'Courier New, monospace'
  })
  
  // 监听内容变化
  editorInstance.value.onDidChangeModelContent(() => {
    editedContent.value = editorInstance.value?.getValue() || ''
    validationResult.value = null
  })
}

const getMonacoLanguage = (mode: string) => {
  switch (mode) {
    case 'json':
      return 'json'
    case 'xml':
      return 'xml'
    case 'javascript':
      return 'javascript'
    default:
      return 'plaintext'
  }
}

const changeEditorMode = () => {
  if (editorInstance.value) {
    const model = editorInstance.value.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage(editorMode.value))
    }
  }
}

const formatContent = () => {
  if (!editorInstance.value) return
  
  try {
    let formatted = editedContent.value
    
    switch (editorMode.value) {
      case 'json':
        const parsed = JSON.parse(editedContent.value)
        formatted = JSON.stringify(parsed, null, 2)
        break
      case 'xml':
        // 简单的 XML 格式化
        formatted = formatXml(editedContent.value)
        break
      case 'javascript':
        // 可以集成 prettier 或其他格式化工具
        break
    }
    
    editorInstance.value.setValue(formatted)
    validationResult.value = {
      type: 'success',
      message: '格式化成功'
    }
  } catch (error) {
    validationResult.value = {
      type: 'error',
      message: `格式化失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

const validateContent = () => {
  try {
    JSON.parse(editedContent.value)
    validationResult.value = {
      type: 'success',
      message: 'JSON 格式有效'
    }
  } catch (error) {
    validationResult.value = {
      type: 'error',
      message: `JSON 格式无效: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

const resetContent = () => {
  editedContent.value = originalContent.value
  if (editorInstance.value) {
    editorInstance.value.setValue(originalContent.value)
  }
  validationResult.value = null
}

const saveMessage = () => {
  if (props.message) {
    const updatedMessage: Message = {
      ...props.message,
      content: editedContent.value,
      timestamp: new Date().toISOString()
    }
    
    emit('save', updatedMessage)
  }
}

const closeEditor = () => {
  emit('close')
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 简单的 XML 格式化函数
const formatXml = (xml: string) => {
  const PADDING = '  '
  const reg = /(>)(<)(\/*)/g
  let formatted = xml.replace(reg, '$1\r\n$2$3')
  let pad = 0
  
  return formatted.split('\r\n').map(line => {
    let indent = 0
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0
    } else if (line.match(/^<\/\w/) && pad > 0) {
      pad -= 1
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1
    } else {
      indent = 0
    }
    
    const padding = PADDING.repeat(pad)
    pad += indent
    
    return padding + line
  }).join('\r\n')
}

// 监听 message 变化
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    originalContent.value = newMessage.content
    editedContent.value = newMessage.content
    
    // 自动检测内容类型
    try {
      JSON.parse(newMessage.content)
      editorMode.value = 'json'
    } catch {
      if (newMessage.content.trim().startsWith('<')) {
        editorMode.value = 'xml'
      } else {
        editorMode.value = 'text'
      }
    }
    
    if (editorInstance.value) {
      editorInstance.value.setValue(newMessage.content)
      changeEditorMode()
    }
  }
}, { immediate: true })

// 组件挂载和卸载
onMounted(() => {
  initializeEditor()
})

onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose()
  }
})
</script>

<style scoped>
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
  max-width: 1000px;
  height: 80vh;
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
  background: #f8f9fa;
}

.modal-header h4 {
  margin: 0;
  color: #333;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
}

.editor-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.direction-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.direction-badge.sent {
  background: #e3f2fd;
  color: #1976d2;
}

.direction-badge.received {
  background: #e8f5e8;
  color: #388e3c;
}

.editor-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.mode-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.editor-container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.monaco-editor {
  height: 100%;
  width: 100%;
}

.validation-result {
  margin-bottom: 1rem;
}

.validation-message {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 14px;
}

.validation-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.validation-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background: #f8f9fa;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 14px;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
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
</style>

