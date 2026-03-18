import axiosClient from '../utils/axiosClient';

export interface ProductRequest {
    projectId: string;
    name: string;
    specification?: string;
    brand?: string;
    amount: number;
    useFor?: string;
    buyType: string;
    statusCode?: string;
    dateToUse?: string;
    linkUrl?: string;
    remark?: string;
    categoryIds: number[];
    imageUrl?: string; // String path from upload service
}

export interface ProductResponse {
    id: number;
    name: string;
    specification?: string;
    brand?: string;
    amount: number;
    useFor?: string;
    buyType?: string;
    statusCode?: string;
    dateToUse?: string;
    linkUrl?: string;
    remark?: string;
    imageUrl?: string;
    categories?: { id: number; name: string; code?: string }[];
}

export const productService = {
    // POST /v1/products — สร้าง product ใหม่
    createProduct: async (data: ProductRequest) => {
        const response = await axiosClient.post('/v1/products', data);
        return response.data;
    },

    // PUT /v1/products/{productId} — อัปเดต product ที่มีอยู่
    updateProduct: async (productId: string, data: ProductRequest) => {
        const response = await axiosClient.put(`/v1/products/${productId}`, data);
        return response.data;
    },

    getProduct: async (productId: string): Promise<ProductResponse> => {
        const response = await axiosClient.get(`/v1/products/${productId}`);
        const result = response.data;
        return result?.data ?? result;
    }
};
