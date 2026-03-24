import axiosClient from '../utils/axiosClient';

export interface ProjectRequest {
    name: string;
    description: string;
    status_code: string;
    kickoff_date: string;
    due_date: string;
}

export interface SearchRequest {
    name: string;
    page: number;
    pageSize: number;
}

export interface UpdateProjectRequest {
    name: string;
    description: string;
    status_code: string;
    kickoff_date: string;
    due_date: string;
}

export interface ProductSearchRequest {
    page?: number;
    pageSize?: number;
    search?: string;
}

export const projectService = {
    getAllProjects: async () => {
        const response = await axiosClient.get('/v1/projects');
        return response.data;
    },

    getProjectById: async (id: string) => {
        const response = await axiosClient.get(`/v1/projects/detail/${id}`);
        return response.data;
    },

    createProject: async (data: ProjectRequest) => {
        const response = await axiosClient.post('/v1/projects', data);
        return response.data;
    },

    searchProjects: async (data: SearchRequest) => {
        const response = await axiosClient.post('/v1/projects/search', data);
        return response.data;
    },

    updateProject: async (id: string, data: UpdateProjectRequest) => {
        const response = await axiosClient.put(`/v1/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string) => {
        const response = await axiosClient.delete(`/v1/projects/${id}`);
        return response.data;
    },

    searchProjectProducts: async (projectId: string, data: ProductSearchRequest = {}) => {
        const response = await axiosClient.post(`/v1/products/${projectId}/product`, data);
        return response.data;
    },

    searchProjectProductsWithFilter: async (projectId: string, keyword?: string, statusCode?: string) => {
        const params: any = {};
        if (keyword) params.keyword = keyword;
        if (statusCode) params.statusCode = statusCode;
        const response = await axiosClient.get(`/v1/products/project/${projectId}/search`, { params });
        return response.data;
    }
};
