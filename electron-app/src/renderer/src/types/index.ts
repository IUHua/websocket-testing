// 每条消息结构
export interface Message {
    id: string
    description: string
    type?: string
    inJson?: string
    outJson?: string
    timestamp?: string
}

// 项目结构
export interface Project {
    id: string
    name: string
    description?: string
    createdAt?: string
    typeKey?: string
}

export interface ProjectDetail extends Omit<Project, 'id'> {
    messages?: Message[]
}
