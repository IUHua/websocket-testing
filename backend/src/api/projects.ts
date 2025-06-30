import { Router, Request, Response } from 'express'
import {
    loadProjects,
    saveProjects,
    loadProjectDetail,
    saveProjectDetail
} from '../utils/storage'
import type { Project, Message, ProjectMap, MockData } from '../types'

const router = Router()

let projects = loadProjects()
const mockData: Record<string, Record<string, any>> = {}

/** ✅ 获取所有项目
 * @openapi
 * /projects:
 *   get:
 *     summary: ✅ 获取所有项目
 *     responses:
 *       200:
 *         description: ✅ 返回项目列表
 */
router.get('/projects', (_req: Request, res: Response) => {
    res.json(projects)
})

/** ✅ 创建新项目
 * @openapi
 * /projects:
 *   post:
 *     summary: ✅ 创建新项目
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

    res.json(project)
})

/** ✅ 获取特定项目
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: ✅ 获取特定项目
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

    // const existProject = projects.some((p: Project) => p.id === id);
    // if (existProject) {
    //   const contentDetail = loadProjectDetail(id);
    //   if (!contentDetail) {
    //     res.status(404).json({ error: "项目不存在" });
    //     return;
    //   }
    //   contentDetail.name = name ? name.toString() : contentDetail.name;
    //   saveProjectDetail(contentDetail);

    //   res.json(contentDetail);
    //   return;

    //   // saveProjects(projects);
    //   // return;
    // }

    // const project = projects[req.params.id];
    // if (!project) return
    // res.status(404).json({ error: "项目不存在" });

    // Object.assign(project, req.body);
    // saveProjects(projects);

    // res.json(project);
})

/** ✅ 删除特定项目
 * @openapi
 * /projects/{id}:
 *   delete:
 *     summary: ✅ 删除特定项目
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

    // if (!projects[req.params.id]) {
    //   res.status(404).json({ error: "项目不存在" });
    //   return;
    // }

    // delete projects[req.params.id];
    // saveProjects(projects);

    res.json({ success: true })
})

// ✅ 添加消息
router.post('/projects/:id/messages', (req: Request, res: Response) => {
    // const project = projects[req.params.id];
    // if (!project) return
    // res.status(404).json({ error: "项目不存在" });

    // const message: Message = {
    //   id: Date.now().toString(),
    //   direction: req.body.direction,
    //   content: req.body.content,
    //   timestamp: new Date().toISOString(),
    //   type: "sent"
    // };

    // project.messages.push(message);
    // // saveProjects(projects);

    res.json(1)
})

// ✅ 导出项目数据
router.get('/projects/:id/export', (req: Request, res: Response) => {
    // const project = projects[req.params.id];
    // if (!project) return
    // res.status(404).json({ error: "项目不存在" });

    // res.setHeader("Content-Type", "application/json");
    // res.setHeader(
    //   "Content-Disposition",
    //   `attachment; filename="${project.name}.json"`
    // );
    res.json(1)
})

// ✅ 设置 Mock 数据
router.post('/mock/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    const { request, response: responseMock } = req.body

    if (!mockData[projectId]) {
        mockData[projectId] = {}
    }

    mockData[projectId][request] = responseMock

    res.json({ success: true })
})

// ✅ 获取 Mock 数据
router.get('/mock/:projectId', (req: Request, res: Response) => {
    const { projectId } = req.params
    res.json(mockData[projectId] || {})
})

export default router
