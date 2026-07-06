import axios from 'axios';
import messaging from './messaging';
class ProxyHttp {
    get(url, config) {
        return this.request({ ...config, method: 'get', url });
    }
    delete(url, config) {
        return this.request({ ...config, method: 'delete', url });
    }
    head(url, config) {
        return this.request({ ...config, method: 'head', url });
    }
    options(url, config) {
        return this.request({ ...config, method: 'options', url });
    }
    post(url, data, config) {
        return this.request({ ...config, method: 'post', url, data });
    }
    put(url, data, config) {
        return this.request({ ...config, method: 'put', url, data });
    }
    patch(url, data, config) {
        return this.request({ ...config, method: 'patch', url, data });
    }
    async request(config) {
        const request = {
            type: 'HTTP_REQUEST',
            config
        };
        const response = await messaging.sendMessage(request);
        if (response.success) {
            return response.data;
        }
        else {
            throw response.error;
        }
    }
    getUri(config) {
        return axios.getUri(config);
    }
}
export default new ProxyHttp();
//# sourceMappingURL=proxy-http.js.map