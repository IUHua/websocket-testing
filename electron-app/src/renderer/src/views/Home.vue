<template>
    <div class="Home">
        <el-container>
            <el-header>
                <h2>项目管理</h2>
                <el-button type="primary" plain @click="dialogForm = true">
                    新增项目
                </el-button>
            </el-header>
            <el-main>
                <el-row :gutter="20">
                    <el-col
                        v-for="project in projects"
                        :key="project.id"
                        :xs="12"
                        :sm="8"
                        :md="6"
                        :lg="6"
                        :xl="4"
                    >
                        <div
                            class="project_item"
                            @click="
                                router.push({
                                    path: '/Message',
                                    query: { projectId: project.id }
                                })
                            "
                        >
                            <UseImage :text="project.name" />
                            <div class="name">
                                {{ project.name }}
                            </div>
                            <div class="description">
                                {{ project.description || '-' }}
                            </div>
                            <div
                                class="delete"
                                @click.stop="deleteProject(project.id)"
                            >
                                <el-icon color="#ff5757"><Delete /></el-icon>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>

    <el-dialog v-model="dialogForm" title="新建项目" width="500">
        <div class="dialog_box">
            <el-form
                ref="ruleFormRef"
                :rules="rules"
                :model="ProjectForm"
                label-width="100"
            >
                <el-form-item label="项目名称" prop="name">
                    <el-input v-model.trim="ProjectForm.name" />
                </el-form-item>
                <el-form-item label="项目简介" prop="description">
                    <el-input
                        v-model.trim="ProjectForm.description"
                        type="textarea"
                    />
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogForm = false">取消</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import {
    createProject,
    getProjects,
    deleteProject as deleteProjectApi
} from '@renderer/api/project'
import { onMounted, reactive, ref } from 'vue'
import { Project } from '@renderer/types'
import UseImage from '@renderer/components/UseImage.vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const projects = ref<Project[]>([])
const dialogForm = ref(false)
const ruleFormRef = ref<FormInstance>()
const ProjectForm = ref<Project>({
    name: '',
    description: '',
    id: ''
})
const rules = reactive<FormRules<Project>>({
    name: [
        {
            required: true,
            message: '请输入项目名称',
            trigger: 'blur'
        }
    ]
})

// 初始化
const init = (): void => {
    getProjects().then((res) => {
        projects.value = res
    })
}

// 提交
const submitForm = async (formEl: FormInstance | undefined): Promise<void> => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            await createProject(ProjectForm.value)
            ElMessage({
                type: 'success',
                message: '创建成功'
            })
            init()
            dialogForm.value = false
            ruleFormRef.value?.resetFields()
        } else {
            console.log('error submit!', fields)
        }
    })
}

// 删除项目 deleteProject
const deleteProject = (id: string): void => {
    ElMessageBox.confirm('❌ 确定要删除这个项目吗？', '删除', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
    })
        .then(() => {
            deleteProjectApi(id).then(() => {
                ElMessage({
                    type: 'success',
                    message: '删除成功'
                })
                init()
            })
        })
        .catch(() => {})
}

onMounted(() => {
    init()
})
</script>

<style scoped lang="scss">
.Home {
    width: 100%;
    height: 100%;
}
.el-container {
    .el-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

h2 {
    font-weight: bold;
    color: var(--color-text-default);
}

.el-col {
    margin-bottom: 20px;
}

.project_item {
    // cursor: pointer;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all 0.2s;
    border: 1px solid var(--color-border);
    border-radius: var(--use-border-radius);
    position: relative;
    &:hover {
        border: 1px solid var(--color-border-hover);
        .delete {
            opacity: 1;
        }
    }
    .name {
        font-weight: bold;
        color: var(--color-text-default);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .description {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .delete {
        position: absolute;
        right: 10px;
        top: 10px;
        opacity: 0;
        transition: all 0.5s;
        cursor: pointer;
    }
}
</style>
