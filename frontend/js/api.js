// API Service
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_URL;
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    // Set token
    setToken(token) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    }

    // Remove token
    removeToken() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    }

    // Get headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : data.error?.message || 'Yêu cầu không được thực hiện thành công.';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Upload file - SỬA ĐỂ HỖ TRỢ CẢ POST VÀ PUT
    async upload(endpoint, formData, method = 'POST') {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // KHÔNG set Content-Type cho FormData, browser tự động set

        try {
            const response = await fetch(url, {
                method: method, // Sử dụng method được truyền vào (POST hoặc PUT)
                headers,
                body: formData
            });

            // Kiểm tra content-type của response
            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                // Nếu response là JSON
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    throw new Error(data.error || `Tải tệp không thành công (mã ${response.status})`);
                } else {
                    // Nếu response không phải JSON (có thể là HTML error page)
                    throw new Error(`Tải tệp không thành công (mã ${response.status})`);
                }
            }

            // Parse response nếu thành công
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return { success: true, message: 'Upload successful' };
            }

        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// Create global API instance
const API = new ApiService();
