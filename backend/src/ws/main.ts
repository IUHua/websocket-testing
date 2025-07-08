import { messageData } from '@/api/projects'
import WebSocket from 'ws'

export function setupMainWebSocket() {
    const wss = new WebSocket.Server({ port: 8080 })

    wss.on('connection', (ws) => {
        console.log('新的 WebSocket 连接')
        ws.on('message', (message) => {
            console.log(message)

            const data = JSON.parse(message.toString())
            const outMesage = messageData.messages?.find(
                (i) => i.type === data[i.type]
            )
            if (outMesage) {
                ws.send(JSON.stringify(outMesage.outJson))
            }
        })
        ws.on('close', () => console.log('WebSocket 连接关闭'))
        ws.on('error', (error) => console.error('WebSocket 错误:', error))
    })
}
