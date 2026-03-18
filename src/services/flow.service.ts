import axiosClient from '../utils/axiosClient';

export const flowService = {
    // POST /v1/flow/reqapproved — ส่ง product ขออนุมัติ
    requestApproval: async (productId: string) => {
        const response = await axiosClient.post('/v1/flow/reqapproved', {
            productId,
        });
        return response.data;
    },

    // POST /v1/flow/approved — อนุมัติ product
    approve: async (productId: string, remark?: string) => {
        const response = await axiosClient.post('/v1/flow/approved', {
            productId,
            remark: remark ?? '',
        });
        return response.data;
    },

    // POST /v1/flow/reject — ปฏิเสธ product
    reject: async (productId: string, remark: string) => {
        const response = await axiosClient.post('/v1/flow/reject', {
            productId,
            remark,
        });
        return response.data;
    },

    // POST /v1/flow/approved/procurement - Procurement Section
    procurement: async (data: {
        productId: string;
        procurementType: string;
        dateReceive: string;
        buyFrom: string;
        remark: string;
    }) => {
        const response = await axiosClient.post('/v1/flow/approved/procurement', data);
        return response.data;
    },

    // POST /v1/flow/receive - รับของ
    receive: async (productId: string) => {
        const response = await axiosClient.post('/v1/flow/receive', { productId });
        return response.data;
    },

    // POST /v1/flow/notreceive - ไม่รับของ
    notReceive: async (productId: string, remark: string) => {
        const response = await axiosClient.post('/v1/flow/notreceive', {
            productId,
            remark,
        });
        return response.data;
    },

    withdraw: async (data: {
        productId: string;
        quantity: number;
        remark: string;
    }) => {
        const response = await axiosClient.post('/v1/flow/withdraw', data);
        return response.data;
    },

    // GET /v1/flow/withdraw/{productId}/logs - ดึงประวัติการเบิก
    getWithdrawLogs: async (productId: string) => {
        const response = await axiosClient.get(`/v1/flow/withdraw/${productId}/logs`);
        return response.data;
    },

    // GET /v1/audit-logs/product/{productId} - ดึงประวัติการดำเนินการ (Audit Logs)
    getAuditLogs: async (productId: string) => {
        const response = await axiosClient.get(`/v1/audit-logs/product/${productId}`);
        return response.data;
    },

    // GET /v1/flow/approved/product/{productId} - ดึงประวัติการอนุมัติ/ปฏิเสธที่มีข้อมูลละเอียด
    getRemark: async (productId: string) => {
        const response = await axiosClient.get(`/v1/flow/approved/product/${productId}`);
        return response.data;
    },

    // GET /v1/flow/procurement/product/{productId} - ดึงข้อมูลการจัดซื้อ
    getProcurement: async (productId: string) => {
        const response = await axiosClient.get(`/v1/flow/procurement/product/${productId}`);
        return response.data;
    },
};
