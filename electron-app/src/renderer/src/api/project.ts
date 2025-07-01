import request from '@renderer/utils/request'
import { Project, ProjectDetail } from '@renderer/types'

export function getProjects(): Promise<Project[]> {
    return request({
        url: '/projects',
        method: 'get'
    })
}

// /projects post
export function createProject(project: Project): Promise<{ success: boolean }> {
    return request({
        url: '/projects',
        method: 'post',
        data: project
    })
}

// /projects/{id} delete
export function deleteProject(id: string): Promise<{ success: boolean }> {
    return request({
        url: `/projects/${id}`,
        method: 'delete'
    })
}

// /projects/{id} get
export function getProjectDetail(id: string): Promise<ProjectDetail> {
    return request({
        url: `/projects/${id}`,
        method: 'get'
    })
}
