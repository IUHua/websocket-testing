// 每条消息结构
export interface Message {
    id: string
    description: string
    type?: 'sent' | 'received'
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
}

export interface ProjectDetail extends Project {
    messages?: Message[]
}
