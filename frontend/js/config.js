const CONFIG = {
   API_URL: '/api/v1',
   TOKEN_KEY: 'ocs_token',
   USER_KEY: 'ocs_user',
   ENDPOINTS: {
       LOGIN: '/auth/login',
       REGISTER: '/auth/register',
       PROFILE: '/auth/profile',
       REQUEST_OTP: '/auth/request-otp',
       RESET_PASSWORD: '/auth/reset-password',
       DEPARTMENTS: '/departments',
       REQUESTS: '/requests',
       REQUEST_BY_ID: (id) => `/requests/${id}`,
       DOCUMENTS_BY_REQUEST: (requestId) => `/documents/request/${requestId}`,
       UPLOAD_DOCUMENT: '/documents/upload',
       QUESTIONS_BY_REQUEST: (requestId) => `/questions/request/${requestId}`,
       QUESTIONS: '/questions',
       SUBMIT_ANSWER: '/answers/submit',
       SUBMIT_MULTIPLE_ANSWERS: '/answers/submit-multiple',
       USER_ANSWERS: (requestId) => `/answers/request/${requestId}`,
       USER_PROGRESS: (requestId) => `/answers/progress/${requestId}`,
       ANSWER_STATISTICS: (requestId) => `/answers/statistics/${requestId}`,
       DASHBOARD_STATS: '/dashboard/stats'
   }
};

const ROLES = {
   ADMIN: 'ADMIN',
   USER: 'USER'
};
