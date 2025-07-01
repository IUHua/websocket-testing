<template>
    <div class="Message">
        <el-container>
            <el-header>
                <h2>
                    <el-icon @click="router.back()"><HomeFilled /></el-icon>
                    {{ projectDetail?.name }}
                </h2>
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
                    <el-scrollbar height="100%">
                    <div class="content" v-if="nowMessage.id">
                        <div class="message_name">
                            <el-input
                                v-model="nowMessage.description"
                                placeholder="请输入别名"
                            />
                            <el-button type="success" plain>保存</el-button>
                        </div>
                        <div class="message_box">
                            <div class="inJson">
                                <el-input
                                    v-model="nowMessage.inJson"
                                    type="textarea"
                                    :autosize="{ minRows: 10}"
                                    placeholder="Please input"
                                />
                            </div>
                            <div class="sendBtn">
                            <el-button type="primary" plain>发送</el-button>
                            </div>
                            <div class="outJson">
                                 <el-input
                                    v-model="nowMessage.outJson"
                                    type="textarea"
                                    :autosize="{ minRows: 10 }"
                                    placeholder="Please input"
                                />
                            </div>
                        </div>
                    </div>
                    </el-scrollbar>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { getProjectDetail } from '@renderer/api/project'
import { ProjectDetail, Message } from '@renderer/types'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface NewMessage extends Message {
    active?: boolean
}

const route = useRoute()
const router = useRouter()
const messages = ref<NewMessage[]>([])
const projectId = route.query.projectId
const projectDetail = ref<ProjectDetail | null>(null)
const nowMessage = reactive<NewMessage>({
    id: '',
    description: '',
    type: 'sent',
    inJson: '',
    outJson: '',
    timestamp: '',
    active: false
})

const init = (): void => {
    getProjectDetail(projectId as string).then((res) => {
        messages.value = res.messages || []
        messages.value.forEach((message) => {
            message.active = false
        })
        projectDetail.value = res
    })
}

const selectMessage = (message: NewMessage): void => {
    console.log(message)
    messages.value.forEach((message) => {
        message.active = false
    })
    message.active = true
    for (const key in message) {
        nowMessage[key] = message[key]
    }
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
    .message_box{
        // border: 1px solid red;
        flex: 1;
        display: flex;
        flex-direction: column;
        .inJson {
            flex: 1;

            .el-input {
                width: 100%;
                height: 100%;
            }
        }
        .sendBtn {
            padding: 10px;
            text-align: right;
            .el-button {
                // width: 100%;
            }
        }
        .outJson {
            flex: 1;
            margin-bottom: 100px;
            .el-input {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
