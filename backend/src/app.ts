import express from 'express'
import path from 'path'
import projectRoutes from './api/projects'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import cors from 'cors'

const app = express()

const options = {
    definition: {
        openapi: '3.0.0', // 规范版本
        info: {
            title: 'WS_API文档',
            version: '1.0.0'
        },
        servers: [
            {
                url: '/api' // 所有接口都从这个前缀开始
            }
        ]
    },
    // 这里写你的接口注释文件路径（支持 .js 和 .ts）
    apis: ['./src/api/*.ts', './src/api/*.js']
}

const swaggerSpec = swaggerJsdoc(options)

// 挂载swagger-ui中间件

// 挂载 pino-http 中间件，自动记录每次HTTP请求
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    )
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', projectRoutes)

export default app
