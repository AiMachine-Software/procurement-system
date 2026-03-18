import axiosClient from '../utils/axiosClient';

export const fileService = {
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        // npx -y create-vite-app@latest
        // Note: Removing manual Content-Type header is crucial for FormData
        const response = await axiosClient.post('/v1/files/upload', formData);

        // Assuming the backend returns the path directly or in a data object
        // Based on user: Backend จะส่งค่ากลับมาเป็น: /media/products/312d..._image
        if (response.data && typeof response.data === 'object' && response.data.data) {
            return response.data.data;
        }
        return response.data;
    }
};
