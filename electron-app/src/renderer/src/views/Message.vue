<template>
    <div class="Message">
        <el-container>
            <el-header>
                <h2>
                    <el-icon @click="router.back()"><HomeFilled /></el-icon>
                    {{ projectDetail?.name }}
                </h2>
                <div class="selectWs">
                    <el-button
                        :type="wsStatus ? 'warning' : 'primary'"
                        plain
                        @click="connectWs"
                    >
                        {{ wsStatus ? '断开' : '连接' }}
                    </el-button>
                    <el-icon @click="openSetting"><Tools /></el-icon>
                </div>
            </el-header>
            <el-container>
                <el-aside width="20%">
                    <div class="message">
                        <h3>
                            Mock <el-icon @click="addMessage"><Plus /></el-icon>
                        </h3>
                        <div class="message_list">
                            <el-scrollbar height="100%">
                                <div
                                    v-for="message in messages"
                                    :key="message.id"
                                    class="message_item"
                                    :class="message.active ? 'active' : ''"
                                    @click="selectMessage(message)"
                                    @contextmenu="deleteMessage(message)"
                                >
                                    {{ message.description }}
                                </div>
                            </el-scrollbar>
                        </div>
                    </div>
                </el-aside>
                <el-main>
                    <div v-if="nowMessage.id" class="content">
                        <div class="message_name">
                            <el-input
                                v-model="nowMessage.description"
                                placeholder="请输入别名"
                            />

                            <el-button
                                type="success"
                                plain
                                @click="saveMessage"
                            >
                                保存
                            </el-button>
                        </div>
                        <div class="message_box">
                            <div class="inJson">
                                <div
                                    ref="inEditorRef"
                                    style="height: 100%"
                                ></div>
                            </div>
                            <div class="sendBtn">
                                <div class="onlyKey" @click="loadKey"></div>
                                <el-button
                                    type="primary"
                                    plain
                                    :disabled="!wsStatus"
                                    @click="sendMessage"
                                >
                                    发送
                                </el-button>
                            </div>
                            <div class="outJson">
                                <div
                                    ref="outEditorRef"
                                    style="height: 100%"
                                ></div>
                            </div>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>

        <el-dialog v-model="dialogSetting" title="项目配置" width="700">
            <div class="dialog_box">
                <el-form
                    :model="projectForm"
                    label-width="auto"
                    style="max-width: 600px"
                    ref="projectFormRef"
                >
                    <el-form-item label="项目名称" prop="name" required>
                        <el-input
                            v-model="projectForm.name"
                            placeholder="请输入项目名称"
                        />
                    </el-form-item>
                    <el-form-item label="项目描述" prop="description">
                        <el-input
                            v-model="projectForm.description"
                            placeholder="请输入项目描述"
                        />
                    </el-form-item>
                    <el-form-item label="Type Key" prop="typeKey">
                        <el-input
                            v-model="projectForm.typeKey"
                            placeholder="请输入项目描述"
                        />
                    </el-form-item>
                    <el-form-item label="WS配置">
                        <el-radio-group v-model="radioWs" @change="changeWs">
                            <el-radio value="target">目标地址</el-radio>
                            <el-radio value="local" disabled>Mock地址</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        label="目标地址"
                        v-show="radioWs === 'target'"
                    >
                        <el-input
                            v-model="wsTarget"
                            placeholder="Please input"
                            class="input-with-select"
                        >
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogSetting = false">取消</el-button>
                    <el-button
                        type="primary"
                        @click="submitForm(projectFormRef)"
                    >
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { getProjectDetail, updateProject } from '@renderer/api/project'
import { ProjectDetail, Message } from '@renderer/types'
import { onMounted, reactive, ref, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as monaco from 'monaco-editor'
import { ElMessage, FormInstance } from 'element-plus'
import {
    createMessage,
    updateMessage,
    deleteMessage as deleteMessageApi
} from '@renderer/api/message'

interface NewMessage extends Message {
    active?: boolean
}

const route = useRoute()
const router = useRouter()
const messages = ref<NewMessage[]>([])
const projectId = route.query.projectId
const projectDetail = ref<ProjectDetail | null>(null)
const inEditorRef = ref()
const outEditorRef = ref()
const radioWs = ref('target')
const wsTarget = ref('wss://echo.websocket.org')
const wsStatus = ref(false)
const onlyKeys = ref<string[]>([])
const dialogSetting = ref(false)
const nowMessage = reactive<NewMessage>({
    id: '',
    description: '',
    type: 'sent',
    inJson: '',
    outJson: '',
    timestamp: '',
    active: false
})
const projectFormRef = ref<FormInstance>()
const projectForm = ref({
    name: '',
    description: '',
    typeKey: ''
})
let inCode
let outCode
let ws: WebSocket | null = null

const init = (): void => {
    getProjectDetail(projectId as string).then((res) => {
        messages.value = res.messages || []
        messages.value.forEach((message) => {
            message.active = false
        })
        projectDetail.value = res
    })
}

// 打开编辑项目弹窗
const openSetting = () => {
    if (projectDetail.value) {
        projectForm.value = {
            name: projectDetail.value.name,
            description: projectDetail.value.description || '',
            typeKey: projectDetail.value.typeKey || ''
        }
    }

    dialogSetting.value = true
}

// 编辑项目
const submitForm = async (formEl: FormInstance | undefined) => {
    // 检查表单值是否有变化
    const hasFormChanged = (): boolean => {
        if (!projectDetail.value) return false
        return (
            projectForm.value.name !== projectDetail.value.name ||
            projectForm.value.description !== projectDetail.value.description ||
            projectForm.value.typeKey !== projectDetail.value.typeKey
        )
    }

    // 如果表单没有改变,则不提交
    if (!hasFormChanged()) {
        dialogSetting.value = false
        return
    }
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            console.log('submit!')
            await updateProject(projectId as string, projectForm.value)
            ElMessage({
                type: 'success',
                message: '更新成功'
            })
            dialogSetting.value = false
            init()
        } else {
            console.log('error submit!', fields)
        }
    })
}

// 监听项目变化
const changeWs = (value: string): void => {
    console.log(value)
    // if (value === 'target') {

    // }
}

// 加载Key
const loadKey = (): void => {
    const inModel = inCode.getModel()

    const inMarkers = monaco.editor.getModelMarkers({ resource: inModel.uri })

    if (inMarkers.length === 0) {
        console.log('代码格式正确！🎉')
        nowMessage.inJson = inCode.getValue()
        onlyKeys.value = Object.keys(JSON.parse(nowMessage.inJson || ''))
    } else {
        console.log('代码格式有错误：', inMarkers)
        inMarkers.forEach((marker) => {
            console.log(`第${marker.startLineNumber}行: ${marker.message}`)
        })
        ElMessage({
            type: 'error',
            message: 'JSON代码格式有错误！'
        })
    }
}

// 选择消息
const selectMessage = (message: NewMessage): void => {
    messages.value.forEach((message) => {
        message.active = false
    })
    message.active = true
    for (const key in message) {
        nowMessage[key] = message[key]
    }
    setInCode()
    setOutCode()
}

// 添加消息
const addMessage = async (): Promise<void> => {
    await createMessage(projectId as string, {
        description: '新建消息',
        type: '',
        inJson: '',
        outJson: '',
        timestamp: '',
        id: ''
    })
    init()
}

// 删除消息
const deleteMessage = async (message: Message): Promise<void> => {
    await deleteMessageApi(projectId as string, message.id)
    ElMessage({
        type: 'success',
        message: '删除成功'
    })
    init()
}

// 重置code编辑器
const setInCode = async (): Promise<void> => {
    if (!nowMessage.id) return
    await nextTick(() => {
        if (inCode) {
            inCode.dispose()
            inCode = null
        }

        inCode = monaco.editor.create(inEditorRef.value, {
            value: nowMessage.inJson,
            language: 'json',
            theme: 'vs-dark'
        })
    })
}
// 重置code编辑器
const setOutCode = async (): Promise<void> => {
    if (!nowMessage.id) return
    await nextTick(() => {
        if (outCode) {
            outCode.dispose()
            outCode = null
        }

        outCode = monaco.editor.create(outEditorRef.value, {
            value: nowMessage.outJson,
            language: 'json',
            theme: 'vs-dark'
        })
    })
}

// 检测代码格式
const checkCodeFormat = (): { success: boolean; message: string } => {
    const inModel = inCode.getModel()

    const inMarkers = monaco.editor.getModelMarkers({ resource: inModel.uri })

    if (inMarkers.length === 0) {
        console.log('代码格式正确！🎉')
        // return { success: true, message: '代码格式正确！🎉' }
    } else {
        console.log('代码格式有错误：', inMarkers)
        inMarkers.forEach((marker) => {
            console.log(`第${marker.startLineNumber}行: ${marker.message}`)
        })
        return {
            success: false,
            message: `发送参数 第${inMarkers[0].startLineNumber}行: ${inMarkers[0].message}`
        }
    }
    const outModel = outCode.getModel()

    const outMarkers = monaco.editor.getModelMarkers({ resource: outModel.uri })

    if (outMarkers.length === 0) {
        console.log('代码格式正确！🎉')
        // return { success: true, message: '代码格式正确！🎉' }
    } else {
        console.log('代码格式有错误：', outMarkers)
        outMarkers.forEach((marker) => {
            console.log(`第${marker.startLineNumber}行: ${marker.message}`)
        })
        return {
            success: false,
            message: `接收数据 第${outMarkers[0].startLineNumber}行: ${outMarkers[0].message}`
        }
    }
    return { success: true, message: '代码格式正确！🎉' }
}

// 保存消息
const saveMessage = (): void => {
    const checkCode = checkCodeFormat()
    if (!checkCode.success) {
        ElMessage({
            type: 'error',
            message: checkCode.message
        })
        return
    }
    nowMessage.inJson = inCode.getValue()
    nowMessage.outJson = outCode.getValue()

    if (projectDetail.value?.typeKey) {
        // nowMessage.type = inCode projectDetail.value?.typeKey
        try {
            const inJson = JSON.parse(inCode.getValue())
            nowMessage.type = inJson[projectDetail.value?.typeKey]
            if (!nowMessage.type) {
                ElMessage({
                    type: 'info',
                    message:
                        'typeKey 不存在,请在设置中查看typeKey，保证与输入一致'
                })
            }
        } catch (error) {}
    }

    updateMessage(projectId as string, nowMessage).then((_res) => {
        ElMessage({
            type: 'success',
            message: '保存成功'
        })
        init()
    })
}

// 连接ws
const connectWs = (): void => {
    if (wsStatus.value) {
        ws?.close()
        return
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
        ElMessage({
            type: 'info',
            message: 'WebSocket 已连接'
        })
        wsStatus.value = true
        return
    }
    wsStatus.value = false
    let wsUrl = ''
    if (radioWs.value === 'target') {
        wsUrl = wsTarget.value
    } else {
        wsUrl = 'ws://localhost:8080' // Mock地址可根据实际情况修改
    }
    if (!wsUrl) {
        ElMessage({
            type: 'warning',
            message: '请输入WebSocket地址'
        })
        return
    }
    try {
        ws = new WebSocket(wsUrl)
        ws.onopen = () => {
            ElMessage({
                type: 'success',
                message: 'WebSocket 连接成功'
            })
            wsStatus.value = true
        }
        ws.onerror = () => {
            ElMessage({
                type: 'error',
                message: 'WebSocket 连接失败'
            })
            ws = null
        }
        ws.onclose = () => {
            ElMessage({
                type: 'info',
                message: 'WebSocket 已关闭'
            })
            ws = null
            wsStatus.value = false
        }
        ws.onmessage = (msg) => {
            console.log(msg.data)
            nowMessage.outJson = msg.data
            setOutCode()
        }
    } catch {
        ElMessage({
            type: 'error',
            message: 'WebSocket 连接异常'
        })
        ws = null
    }
}

// 发送消息
const sendMessage = async (): Promise<void> => {
    nowMessage.inJson = inCode.getValue()
    await setInCode()
    if (ws && ws.readyState === WebSocket.OPEN) {
        wsStatus.value = true
        ws?.send(nowMessage.inJson as string)
        return
    } else {
        ElMessage({
            type: 'warning',
            message: '请先连接WebSocket'
        })
    }
}

onMounted(() => {
    init()
})

// onBeforeRouteLeave((to, from, next) => {
//     const answer = window.confirm('你还没保存，确定要离开吗？🫣')
//     ws?.close()
//     if (answer) {
//         next() // 继续跳转
//     } else {
//         next(false) // 阻止跳转
//     }
// })

onUnmounted(() => {
    ws?.close()
})
</script>

<style scoped lang="scss">
.Message {
    width: 100%;
    height: 100%;
}
.el-container {
    height: 100%;
    .el-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color);
    }
    .el-aside {
        border-right: 1px solid var(--el-border-color);
    }
    .el-main {
        padding: 0;
    }
}
.selectWs {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
h2 {
    font-weight: bold;
    color: var(--color-text-default);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    .el-icon {
        cursor: pointer;
    }
}

.message {
    height: 100%;
    display: flex;
    flex-direction: column;

    h3 {
        color: var(--color-text-default);
        font-weight: bold;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .el-icon {
            cursor: pointer;
        }
    }
    .message_list {
        flex: 1;
        padding: 0 10px;
        .message_item {
            padding: 10px;
            border-radius: var(--use-border-radius);
            cursor: pointer;
            &:not(.active):hover {
                background: var(--use-background-color);
            }
        }
        .active {
            // background: #fb93ff20;
            background: var(--el-color-primary-light-3);
        }
        // overflow: scroll;
    }
}

.content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100%;
    flex: 1;
    .message_name {
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--el-border-color);
        .el-input {
            width: 100%;
            margin-right: 10px;
        }
    }
    .message_box {
        flex: 1;
        display: flex;
        flex-direction: column;
        .inJson {
            flex: 1;

            .el-input {
                width: 100%;
                height: 100%;
            }
            > div {
                background: none;
            }
        }
        .sendBtn {
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .outJson {
            flex: 1;
            .el-input {
                width: 100%;
                height: 100%;
            }
        }
    }
}

.dialog_box {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
}
</style>
