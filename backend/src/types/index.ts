// 每条消息结构
export interface Message {
    id: string
    direction: string
    type: 'sent' | 'received'
    content: string
    timestamp: string
}

// 项目结构
export interface Project {
    id: string
    name: string
    description: string
    createdAt: string
}

export interface ProjectDetail extends Project {
    messages?: Message[]
}

// Mock 数据结构
export type MockData = Record<string, Record<string, any>>

// 项目列表结构
export type ProjectMap = Record<string, Project>
