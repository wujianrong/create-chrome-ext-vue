import axios from 'axios';
export function createHttpInstance(config) {
    const http = axios.create({
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        },
        ...config
    });
    http.interceptors.request.use(requestConfig => {
        return requestConfig;
    }, error => {
        return Promise.reject(error);
    });
    http.interceptors.response.use(response => {
        return response;
    }, error => {
        console.error('HTTP Error:', JSON.stringify(error));
        return Promise.reject(error);
    });
    return http;
}
const http = createHttpInstance();
export default http;
//# sourceMappingURL=http.js.map