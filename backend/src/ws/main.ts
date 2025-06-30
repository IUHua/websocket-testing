import WebSocket from 'ws'

export function setupMainWebSocket() {
  const wss = new WebSocket.Server({ port: 8080 })

  wss.on('connection', (ws) => {
    console.log('新的 WebSocket 连接')

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('收到消息:', data)

        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
            break
          case 'echo':
            ws.send(JSON.stringify({ type: 'echo', data: data.data, timestamp: Date.now() }))
            break
          default:
            ws.send(JSON.stringify({ type: 'response', data: `收到消息: ${data.data}`, timestamp: Date.now() }))
        }
      } catch (error) {
        console.error('处理消息错误:', error)
        ws.send(JSON.stringify({ type: 'error', message: '消息格式错误', timestamp: Date.now() }))
      }
    })

    ws.on('close', () => console.log('WebSocket 连接关闭'))
    ws.on('error', (error) => console.error('WebSocket 错误:', error))
  })
}
