<template>
    <div class="Message">
        <el-container>
            <el-header>
                <h2>
                    <el-icon @click="router.back()"><HomeFilled /></el-icon>
                    {{ projectDetail?.name }}
                </h2>
                <div class="selectWs">
                    <el-radio-group v-model="radioWs">
                        <el-radio style="margin-right: 0" value="target"
                            >目标地址</el-radio
                        >
                        <el-input
                            v-if="radioWs === 'target'"
                            placeholder="目标WS地址"
                            style="width: 300px"
                        ></el-input>
                        <el-radio value="local">Mock地址</el-radio>
                    </el-radio-group>
                </div>
            </el-header>
            <el-container>
                <el-aside width="20%">
                    <div class="message">
                        <h3>Mock</h3>
                        <div class="message_list">
                            <el-scrollbar height="100%">
                                <div
                                    v-for="message in messages"
                                    :key="message.id"
                                    class="message_item"
                                    :class="message.active ? 'active' : ''"
                                    @click="selectMessage(message)"
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
                                <!-- <el-input
                                        v-model="nowMessage.inJson"
                                        type="textarea"
                                        :autosize="{ minRows: 10 }"
                                        placeholder="Please input"
                                    /> -->
                                <div
                                    ref="inEditorRef"
                                    style="height: 100%"
                                ></div>
                            </div>
                            <div class="sendBtn">
                                <el-button type="primary" plain>发送</el-button>
                            </div>
                            <div class="outJson">
                                <!-- <el-input
                                    v-model="nowMessage.outJson"
                                    type="textarea"
                                    :autosize="{ minRows: 10 }"
                                    placeholder="Please input"
                                /> -->
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
    </div>
</template>

<script setup lang="ts">
import { getProjectDetail } from '@renderer/api/project'
import { ProjectDetail, Message } from '@renderer/types'
import { onMounted, reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as monaco from 'monaco-editor'
import { ElMessage } from 'element-plus'
import { updateMessage } from '@renderer/api/message'

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
const nowMessage = reactive<NewMessage>({
    id: '',
    description: '',
    type: 'sent',
    inJson: '',
    outJson: '',
    timestamp: '',
    active: false
})
let inCode
let outCode

const init = (): void => {
    getProjectDetail(projectId as string).then((res) => {
        messages.value = res.messages || []
        messages.value.forEach((message) => {
            message.active = false
        })
        projectDetail.value = res
    })
}

// 选择消息
const selectMessage = (message: NewMessage): void => {
    console.log(message)
    messages.value.forEach((message) => {
        message.active = false
    })
    message.active = true
    for (const key in message) {
        nowMessage[key] = message[key]
    }
    nextTick(() => {
        if (inCode) {
            inCode.dispose()
            inCode = null
        }
        if (outCode) {
            outCode.dispose()
            outCode = null
        }
        inCode = monaco.editor.create(inEditorRef.value, {
            value: nowMessage.inJson,
            language: 'json',
            theme: 'vs-dark'
        })

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
    updateMessage(projectId as string, nowMessage).then((res) => {
        console.log(res)
        ElMessage({
            type: 'success',
            message: '保存成功'
        })
        init()
    })
}

onMounted(() => {
    init()
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
    .el-radio-group {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 10px;
        flex-wrap: nowrap;
        gap: 20px;
    }
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
        gap: 10px;
        border-bottom: 1px solid var(--el-border-color);
        .el-input {
            width: 100%;
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
            text-align: right;
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
</style>
