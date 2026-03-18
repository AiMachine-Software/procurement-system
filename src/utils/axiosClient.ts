import axios from 'axios';

// Create an Axios instance
const axiosClient = axios.create({
    // Use the API URL from environment variables, or a relative path by default
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request Interceptor: Attach Token automatically
axiosClient.interceptors.request.use(
    (config) => {
        // You can change 'token' to whatever key you use in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
axiosClient.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response?.status === 401) {
            // e.g., Token expired or invalid
            console.error('Unauthorized access. Redirecting to login...');
            // Optional: Handle auto-logout here by clearing token and redirecting
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
