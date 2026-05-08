class ApiService {
    constructor() {
        this.baseURL = '/api/v1';
    }

    getToken() {
        return localStorage.getItem('ocs_token');
    }

    setToken(token) {
        localStorage.setItem('ocs_token', token);
    }

    getHeaders(includeAuth = true, isFormData = false) {
        const headers = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false, options.isFormData)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }
}

const API = new ApiService();
