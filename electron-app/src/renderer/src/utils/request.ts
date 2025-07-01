import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
    baseURL: '/api', // ✅ 你的 API 前缀，或空字符串
    timeout: 10 * 1000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器（自动加 token）
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器（统一处理响应）
service.interceptors.response.use(
    (res) => {
        const { data } = res

        return data // ✨返回业务数据部分
    },
    (err) => {
        ElMessage({
            type: 'error',
            message: err.response.data.error || '请求错误'
        })
        return Promise.reject(err)
    }
)

export default service
