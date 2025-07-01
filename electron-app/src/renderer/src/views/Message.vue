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
                <el-main>Main</el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { getProjectDetail } from '@renderer/api/project'
import { ProjectDetail, Message } from '@renderer/types'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface NewMessage extends Message {
    active?: boolean
}

const route = useRoute()
const router = useRouter()
const messages = ref<NewMessage[]>([])
const projectId = route.query.projectId
const projectDetail = ref<ProjectDetail | null>(null)

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
    }
    .el-aside {
        border: 1px solid red;

        // padding: 20px;
    }
    .el-main {
        border: 1px solid red;
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
</style>
