import fs from 'fs'
import path from 'path'
import type {
    Project,
    Message,
    ProjectMap,
    MockData,
    ProjectDetail
} from '../types'

const DATA_DIR = path.join(__dirname, '../../data')

export const projectFile = path.join(DATA_DIR, 'Project.json')
let content = [] as Array<Project>

export function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR)
    }
    if (!fs.existsSync(projectFile)) {
        fs.writeFileSync(projectFile, JSON.stringify([], null, 2), 'utf-8')
    } else {
        content = JSON.parse(fs.readFileSync(projectFile, 'utf-8')) || []
    }
}

/**
 * 加载所有项目
 * @returns {Record<string, any>} 返回项目列表
 */
export function loadProjects(): Project[] {
    ensureDataDir()
    return content
}

/** 存储项目
 * @param project 项目对象
 * @returns {boolean} 成功或失败
 */
export function saveProjects(project: Project) {
    ensureDataDir()
    try {
        // 判断content中是否存在项目名称

        const existName = content.some((item) => item.name === project.name)
        const existId = content.some((item) => item.id === project.id)

        if (existName) {
            console.log(`项目名称 "${project.name}" 已存在`)
            return false
        } else if (existId) {
            console.log(`项目详细文件改名 "${project.name}"`)
            content.map((i) => {
                if (i.id === project.id) {
                    i.name = project.name
                }
                return i
            })
            fs.writeFileSync(
                projectFile,
                JSON.stringify(content, null, 2),
                'utf-8'
            )
            return true
        } else {
            content.push(project)
            fs.writeFileSync(
                projectFile,
                JSON.stringify(content, null, 2),
                'utf-8'
            )
        }
    } catch (error) {
        return false
    }
    return true
}

/** 加载特定项目详情
 * @param projectId 项目ID
 * @returns {Project | null} 返回项目详情或null
 */
export function loadProjectDetail(projectId: string): ProjectDetail | null {
    ensureDataDir()
    const projectFilePath = path.join(DATA_DIR, `${projectId}.json`)
    if (fs.existsSync(projectFilePath)) {
        try {
            const content = fs.readFileSync(projectFilePath, 'utf-8')
            return JSON.parse(content)
        } catch (err) {
            console.error(`加载项目 ${projectId} 详情失败:`, err)
            return null
        }
    }
    console.warn(`项目 ${projectId} 不存在`)
    return null
}

/** 存储项目详细
 * @param project 项目对象
 * @returns {boolean} 成功或失败
 */
export function saveProjectDetail(projectDetail: ProjectDetail): boolean {
    ensureDataDir()
    const projectDeatilFile = path.join(DATA_DIR, `${projectDetail.id}.json`)

    try {
        fs.writeFileSync(
            projectDeatilFile,
            JSON.stringify(projectDetail, null, 2),
            'utf-8'
        )
        return true
    } catch (err) {
        console.error(`保存项目 ${projectDetail.id} 详情失败:`, err)
        return false
    }
}

/** 删除指定项目
 * @param projectId 项目ID
 * @returns {boolean} 删除成功或失败
 */
export function deleteProject(projectId: string): boolean {
    ensureDataDir()
    // 删除列表中的项目
    content = content.filter((item) => item.id !== projectId)
    fs.writeFileSync(projectFile, JSON.stringify(content, null, 2), 'utf-8')

    // 删除项目详细文件
    const mockFilePath = path.join(DATA_DIR, `${projectId}.json`)
    if (fs.existsSync(mockFilePath)) {
        try {
            fs.unlinkSync(mockFilePath)
            return true
        } catch (err) {
            console.error(`删除项目 ${projectId} 详情失败:`, err)
            return false
        }
    } else {
        console.warn(`项目 ${projectId} 详情不存在`)
        return false
    }
    return true
}

/** 更新项目message
 * @param projectId 项目ID
 * @param message message对象
 * @returns {ProjectMap} 项目列表
 */
export function updateProjectMessage(
    projectId: string,
    message: Message[]
): boolean {
    ensureDataDir()
    const projectFilePath = path.join(DATA_DIR, `${projectId}.json`)
    if (fs.existsSync(projectFilePath)) {
        try {
            const content = fs.readFileSync(projectFilePath, 'utf-8')
            const projectDetail = JSON.parse(content)
            projectDetail.messages = message
            fs.writeFileSync(
                projectFilePath,
                JSON.stringify(projectDetail, null, 2),
                'utf-8'
            )
        } catch (err) {
            console.error(`更新项目 ${projectId} 详情失败:`, err)
            return false
        }
    }
    return true
}
