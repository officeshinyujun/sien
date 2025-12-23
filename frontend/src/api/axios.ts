import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Update this if your backend runs on a different port/host
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the access token to headers if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
