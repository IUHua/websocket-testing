import { Message } from '@renderer/types'
import request from '@renderer/utils/request'

// /messages/{projectId} put
export function updateMessage(
    projectId: string,
    message: Message
): Promise<{ success: boolean }> {
    return request.put(`/messages/${projectId}`, message)
}

// /messages/{projectId} post
export function createMessage(
    projectId: string,
    message: Message
): Promise<{ success: boolean }> {
    return request({
        url: `/messages/${projectId}`,
        method: 'post',
        data: message
    })
}

// /messages/{projectId} delete
export function deleteMessage(
    projectId: string,
    messageId: string
): Promise<{ success: boolean }> {
    return request({
        url: `/messages/${projectId}`,
        method: 'delete',
        data: {
            id: messageId
        }
    })
}
