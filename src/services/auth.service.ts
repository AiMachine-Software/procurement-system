import axiosClient from '../utils/axiosClient';

export interface LoginRequest {
    email?: string;
    password?: string;
    credential?: string; // Kept in case of Google Auth
}

export const authService = {
    // Login function pointing to your Backend API
    login: async (credentials: LoginRequest) => {
        // Calling: /api/v1/auth/login
        const response = await axiosClient.post('/v1/auth/login', credentials);

        // Save token using standard "access_token" or "token" key 
        // depending on what your backend sends back
        if (response.data?.token || response.data?.access_token) {
            const tokenToSave = response.data.token || response.data.access_token;
            localStorage.setItem('token', tokenToSave);
        }

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Decode JWT payload จาก localStorage เพื่อดึง userId (ไม่ต้องเรียก API)
    getCurrentUserId: (): string | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            // รองรับ claim หลายแบบที่ backend อาจใช้
            return payload.sub || payload.userId || payload.user_id || payload.id || null;
        } catch {
            return null;
        }
    },

    getCurrentUserName: (): string | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.name || payload.username || payload.fullName || payload.preferred_username || null;
        } catch {
            return null;
        }
    }
};
