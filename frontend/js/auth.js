class AuthService {
   constructor() {
       this.user = this.getStoredUser();
   }

   getStoredUser() {
       const userStr = localStorage.getItem(CONFIG.USER_KEY);
       return userStr ? JSON.parse(userStr) : null;
   }

   storeUser(user) {
       localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
       this.user = user;
   }

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
           throw new Error('Login failed');
       } catch (error) {
           throw error;
       }
   }

   logout() {
       localStorage.clear();
       window.location.href = '/pages/login.html';
   }

   isLoggedIn() {
       return !!API.getToken() && !!this.user;
   }

   isAdmin() {
       return this.user && this.user.role === 'ADMIN';
   }

   getCurrentUser() {
       return this.user;
   }

   requireAuth() {
       if (!this.isLoggedIn()) {
           window.location.href = '/pages/login.html';
           return false;
       }
       return true;
   }
}

const AUTH = new AuthService();
