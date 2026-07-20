import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * 创建axios实例的工厂函数
 * @param config 额外的配置项（可选）
 * @returns 配置好的axios实例
 */
export function createHttpInstance(config?: AxiosRequestConfig): AxiosInstance {
  const http: AxiosInstance = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    ...config
  })

  // 请求拦截器
  http.interceptors.request.use(
    requestConfig => {
      return requestConfig
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  http.interceptors.response.use(
    response => {
      return response
    },
    error => {
      console.error('HTTP Error:', JSON.stringify(error))
      return Promise.reject(error)
    }
  )

  return http
}

// 默认导出一个基础实例
const http: AxiosInstance = createHttpInstance()
export default http
