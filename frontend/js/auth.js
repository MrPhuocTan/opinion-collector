// Authentication Service
class AuthService {
    constructor() {
        this.user = this.getStoredUser();
    }

    // Get stored user
    getStoredUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Store user
    storeUser(user) {
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
        this.user = user;
    }

    // Remove user
    removeUser() {
        localStorage.removeItem(CONFIG.USER_KEY);
        this.user = null;
    }

    // Login
    async login(username, password) {
        try {
            const response = await API.post(CONFIG.ENDPOINTS.LOGIN, {
                username,
                password
            });

            if (response.token) {
                API.setToken(response.token);
                this.storeUser(response.user);
                return response;
            }

            throw new Error('Đăng nhập không thành công');
        } catch (error) {
            throw error;
        }
    }


    // Register
    async register(userData) {
        try {
            const response = await API.post(CONFIG.ENDPOINTS.REGISTER, userData);

            if (response.token) {
                API.setToken(response.token);
                this.storeUser(response.user);
                return response;
            }

            throw new Error('Đăng ký tài khoản không thành công');
        } catch (error) {
            throw error;
        }
    }

    // Logout
    logout() {
        API.removeToken();
        this.removeUser();
        // Use absolute path for nginx
        window.location.href = '/pages/login.html';
    }

    // Check if logged in
    isLoggedIn() {
        return !!API.getToken() && !!this.user;
    }

    // Check if admin
    isAdmin() {
        return this.user && this.user.role === ROLES.ADMIN;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Request OTP
    async requestOTP(phone) {
        return API.post(CONFIG.ENDPOINTS.REQUEST_OTP, { phone });
    }

    // Reset password
    async resetPassword(phone, otp, newPassword) {
        return API.post(CONFIG.ENDPOINTS.RESET_PASSWORD, {
            phone,
            otp,
            newPassword
        });
    }

    // Check auth and redirect if needed
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }

    // Check admin and redirect if needed
    requireAdmin() {
        if (!this.isAdmin()) {
            alert('Quý vị không có thẩm quyền quản trị để truy cập chức năng này.');
            window.location.href = '/pages/user-dashboard.html';
            return false;
        }
        return true;
    }

    // Navigate to dashboard based on role
    navigateToDashboard() {
        if (this.isAdmin()) {
            window.location.href = '/pages/admin-dashboard.html';
        } else {
            window.location.href = '/pages/user-dashboard.html';
        }
    }
    // Get token for export
    getToken() {
        return API.getToken();
    }

}

// Create global auth instance
const AUTH = new AuthService();
