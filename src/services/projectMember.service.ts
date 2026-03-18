import axiosClient from '../utils/axiosClient';

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    active: boolean;
}

export interface RoleResponse {
    id: string;
    code: string;
    name: string;
}

export interface ProjectMemberResponse {
    id: string;
    projectId: string;
    roleCode: string;
    userId: string;
    userName: string;
}

export interface ProjectMemberRequest {
    projectId: string;
    userId: string;
    roleCode: string;
}

export const projectMemberService = {
    getUsers: async (): Promise<UserResponse[]> => {
        const response = await axiosClient.get('/v1/project-members/users');
        const data = response.data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    },

    getRoles: async (): Promise<RoleResponse[]> => {
        const response = await axiosClient.get('/v1/roles');
        const data = response.data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    },

    addMember: async (data: ProjectMemberRequest) => {
        const response = await axiosClient.post('/v1/project-members', data);
        return response.data;
    },

    getProjectMembers: async (projectId: string): Promise<ProjectMemberResponse[]> => {
        const response = await axiosClient.get(`/v1/project-members/project/${projectId}`);
        const data = response.data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    },

    removeMember: async (id: string) => {
        const response = await axiosClient.delete(`/v1/project-members/${id}`);
        return response.data;
    }
};
