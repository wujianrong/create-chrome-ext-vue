import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import messaging from './messaging'

interface ProxyHttpRequest {
  type: 'HTTP_REQUEST'
  config: AxiosRequestConfig
}

interface ProxyHttpResponse {
  success: boolean
  data?: AxiosResponse
  error?: AxiosError
}

class ProxyHttp {
  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'get', url })
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'delete', url })
  }

  head<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'head', url })
  }

  options<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'options', url })
  }

  post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'post', url, data })
  }

  put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.request({ ...config, method: 'patch', url, data })
  }

  async request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    const request: ProxyHttpRequest = {
      type: 'HTTP_REQUEST',
      config
    }

    const response: ProxyHttpResponse = await messaging.sendMessage(request)

    if (response.success) {
      return response.data as R
    } else {
      throw response.error
    }
  }

  // 提供axios原有的一些工具方法
  getUri(config?: AxiosRequestConfig): string {
    return axios.getUri(config)
  }
}

export default new ProxyHttp()
