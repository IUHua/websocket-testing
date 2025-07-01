import { Router, Request, Response } from 'express'
import {
    loadProjects,
    saveProjects,
    loadProjectDetail,
    saveProjectDetail,
    deleteProject
} from '../utils/storage'
import type { Project, Message, ProjectDetail } from '../types'

const router = Router()

let projects = loadProjects()
let messageData = {} as ProjectDetail

/** ✅ 获取所有项目
 * @openapi
 * /projects:
 *   get:
 *     summary: ✅ 获取所有项目
 *     tags:
 *       - 项目管理
 *     responses:
 *       200:
 *         description: ✅ 返回项目列表
 */
router.get('/projects', (_req: Request, res: Response) => {
    projects = loadProjects()
    res.json(projects)
})

/** ✅ 创建新项目
 * @openapi
 * /projects:
 *   post:
 *     summary: ✅ 创建新项目
 *     tags:
 *      - 项目管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 项目名称
 *                 example: 表单项目001
 *               description:
 *                 type: string
 *                 description: 项目介绍
 *                 example: 表单项目001
 *     responses:
 *       200:
 *         description: ✅ 创建成功
 */
router.post('/projects', (req: Request, res: Response) => {
    const { name, description } = req.body

    const projectId = Date.now().toString()

    const project: Project = {
        id: projectId,
        name: name || `项目 ${projectId}`,
        description: description || '',
        createdAt: new Date().toISOString()
    }

    // projects[projectId] = project;
    const existFile = saveProjects(project)
    if (!existFile) {
        res.status(500).json({ error: '项目文件已存在' })
        return
    }
    saveProjectDetail({
        ...project,
        messages: []
    })

    res.json({ success: true })
})

/** ✅ 获取特定项目
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: ✅ 获取特定项目
 *     tags:
 *       - 项目管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: ✅ 返回项目详情
 */
router.get('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params

    const project = projects.some((p: Project) => p.id === id)
    if (project) {
        const contentDetail = loadProjectDetail(id)
        if (!contentDetail) {
            res.status(404).json({ error: '项目不存在' })
            return
        }
        messageData = contentDetail
        res.json(contentDetail)
        return
    }
    res.status(404).json({ error: '项目不存在' })
})

/** ✅ 更新特定项目
 * @openapi
 * /projects/{id}:
 *   put:
 *     summary: ✅ 更新特定项目
 *     tags:
 *       - 项目管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1751169642083
 *         description: 项目ID
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: 新的项目名称
 *     responses:
 *       200:
 *         description: ✅ 更新成功
 */
router.put('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params
    const { name } = req.query
    // 修改项目
    projects = loadProjects()

    const project = projects.find((p: Project) => p.id === id)

    if (!project) {
        res.status(404).json({ error: '项目不存在' })
        return
    }
    // @debug 这里直接改project.name会导致storage中项目名称一起改变？
    // project.name = name ? name.toString() : project.name;
    const saveStatus = saveProjects({
        ...project,
        name: name ? name.toString() : project.name
    })

    if (!saveStatus) {
        res.status(400).json({ error: '项目名称已存在' })
        return
    }

    // 修改项目详细
    const contentDetail = loadProjectDetail(id)
    if (!contentDetail) {
        res.status(404).json({ error: '项目不存在' })
        return
    }

    saveProjectDetail({
        ...contentDetail,
        name: name ? name.toString() : project.name
    })

    res.json({ success: true, project })
})

/** ✅ 删除特定项目
 * @openapi
 * /projects/{id}:
 *   delete:
 *     summary: ✅ 删除特定项目
 *     tags:
 *       - 项目管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: ✅ 删除成功
 */
router.delete('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params
    console.log(id)

    const success = deleteProject(id)
    if (!success) {
        res.status(500).json({ error: '项目删除失败' })
        return
    }
    res.json({ success: true })
})

/** ✅ 添加消息
 * @openapi
 * /messages/{projectId}:
 *   post:
 *     summary: ✅ 添加消息
 *     tags:
 *       - 消息管理
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           example: 1751197722752
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 description: 项目名称
 *                 example: Ping
 *               description:
 *                 type: object
 *                 description: 项目描述（JSON对象）
 *                 example: string
 *               inJson:
 *                 type: object
 *                 description: 发送的消息
 *                 example: string
 *               outJson:
 *                 type: object
 *                 description: 接收的消息
 *                 example: string
 *     responses:
 *       200:
 *         description: ✅ 添加成功
 */
router.post('/messages/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    const { type, description, inJson, outJson } = req.body

    const message = {
        id: Date.now().toString(),
        description: description || '',
        type: type,
        inJson: inJson || '',
        outJson: outJson || '',
        timestamp: new Date().toISOString()
    } as Message

    // console.log(message)

    const projectDetail = loadProjectDetail(projectId)
    if (!projectDetail) {
        res.status(404).json('项目不存在')
        return
    }

    projectDetail.messages?.push(message)

    if (saveProjectDetail(projectDetail)) {
        res.json(message)
    } else {
        res.status(500).json('保存失败')
    }
})

/** ✍️ 编辑消息
 * @openapi
 * /messages/{projectId}:
 *   put:
 *     summary: ✍️ 编辑消息
 *     tags:
 *       - 消息管理
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           example: 1751253464241
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - type
 *             properties:
 *               id:
 *                 type: string
 *                 description: 项目名称
 *                 example: 1751273208271
 *               type:
 *                 type: string
 *                 description: 项目名称
 *                 example: Ping
 *               description:
 *                 type: object
 *                 description: 项目描述（JSON对象）
 *                 example: string
 *               inJson:
 *                 type: object
 *                 description: 发送的消息
 *                 example: string
 *               outJson:
 *                 type: object
 *                 description: 接收的消息
 *                 example: string
 *     responses:
 *       200:
 *         description: ✍️ 编辑成功
 */
router.put('/messages/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    const { id, type, description, inJson, outJson } = req.body
    console.log(projectId, id, type, description, inJson, outJson)

    const projectDetail = loadProjectDetail(projectId)
    if (!projectDetail) {
        res.status(404).json('项目不存在')
        return
    }
    // projectDetail.messages?.push(message)
    const existMessage = projectDetail.messages?.some((i) => i.id === id)
    if (existMessage) {
        projectDetail.messages?.map((i) => {
            if (i.id === id) {
                i.type = type
                i.description = description
                i.inJson = inJson
                i.outJson = outJson
            }
        })
    } else {
        res.status(404).json('消息不存在')
        return
    }

    if (saveProjectDetail(projectDetail)) {
        res.json({ success: true })
    } else {
        res.status(500).json('编辑失败')
    }
})

/** ✅ 获取指定消息
 * @openapi
 * /messages/{projectId}:
 *   get:
 *     summary: ✅ 获取指定消息
 *     tags:
 *       - 消息管理
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           example: 1751197722752
 *         description: 项目ID
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *           example: 1751299643706
 *         description: 消息ID
 *     responses:
 *       200:
 *         description: ✅ 获取成功
 */
router.get('/messages/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    const { id } = req.query

    // console.log(message)

    let projectDetail = loadProjectDetail(projectId)
    if (!projectDetail) {
        res.status(404).json('项目不存在')
        return
    }

    // projectDetail.messages?.push(message)
    const foundMessage = projectDetail.messages?.find((i) => i.id === id)
    if (foundMessage) {
        // messageData = foundMessage
        res.json(foundMessage)
    } else {
        res.status(404).json('消息不存在')
        return
    }
})

/** ❌ 删除消息
 * @openapi
 * /messages/{projectId}:
 *   delete:
 *     summary: ❌ 删除消息
 *     tags:
 *       - 消息管理
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           example: 1751253464241
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: 消息id
 *                 example: 1751274486301
 *     responses:
 *       200:
 *         description: ✅ 删除成功
 */
router.delete('/messages/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    const { id } = req.body

    // console.log(message)

    let projectDetail = loadProjectDetail(projectId)
    if (!projectDetail) {
        res.status(404).json('项目不存在')
        return
    }

    // projectDetail.messages?.push(message)
    const existMessage = projectDetail.messages?.some((i) => i.id === id)
    if (existMessage) {
        projectDetail.messages = projectDetail.messages?.filter(
            (i) => i.id !== id
        )
    } else {
        res.status(404).json('消息不存在')
        return
    }

    if (saveProjectDetail(projectDetail)) {
        res.json({ success: true })
    } else {
        res.status(500).json('删除失败')
    }
})

export default router

export { messageData }
