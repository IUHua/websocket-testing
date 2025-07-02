import { Message } from '@renderer/types'
import request from '@renderer/utils/request'

// /messages/{projectId} put
export function updateMessage(
    projectId: string,
    message: Message
): Promise<{ success: boolean }> {
    return request.put(`/messages/${projectId}`, message)
}
