import http from 'http'
import app from './app'
import { setupMainWebSocket } from './ws/main'
import { setupMockWebSocket } from './ws/mock'

const PORT = process.env.PORT || 3000
const server = http.createServer(app)

// server.listen(PORT, '0.0.0.0', () => {
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
})

setupMainWebSocket()
setupMockWebSocket()
