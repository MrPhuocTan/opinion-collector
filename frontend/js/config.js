// API Configuration
const CONFIG = {
    API_URL: '/api/v1',  // Changed from http://localhost:3000/api/v1
    TOKEN_KEY: 'ocs_token',
    USER_KEY: 'ocs_user',
    
    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        REQUEST_OTP: '/auth/request-otp',
        RESET_PASSWORD: '/auth/reset-password',
        
        // Departments
        DEPARTMENTS: '/departments',
        GROUPS: '/groups',
        
        // Requests
        REQUESTS: '/requests',
        REQUEST_BY_ID: (id) => `/requests/${id}`,
        
        // Documents
        DOCUMENTS_BY_REQUEST: (requestId) => `/documents/request/${requestId}`,
        UPLOAD_DOCUMENT: '/documents/upload',
        
        // Questions
        QUESTIONS_BY_REQUEST: (requestId) => `/questions/request/${requestId}`,
        QUESTIONS_BY_DOCUMENT: (documentId) => `/questions/document/${documentId}`,
        QUESTIONS: '/questions',
        
        // Answers
        SUBMIT_ANSWER: '/answers/submit',
        SUBMIT_MULTIPLE_ANSWERS: '/answers/submit-multiple',
        USER_ANSWERS: (requestId) => `/answers/request/${requestId}`,
        USER_PROGRESS: (requestId) => `/answers/progress/${requestId}`,
        ANSWER_STATISTICS: (requestId) => `/answers/statistics/${requestId}`,
        
        // Dashboard
        DASHBOARD_STATS: '/dashboard/stats',
        COMPLETION_RATES: '/dashboard/completion-rates',
        DEPARTMENT_PARTICIPATION: '/dashboard/department-participation',
        
        // Lock endpoints
        TOGGLE_LOCK: (id) => `/requests/${id}/toggle-lock`
    }
};

// User roles
const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};

// Question types
const QUESTION_TYPES = {
    BOOLEAN: 'BOOLEAN',
    TEXT: 'TEXT',
    NUMBER: 'NUMBER'
};
