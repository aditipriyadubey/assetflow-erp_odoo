import axiosClient from './axiosClient';

export const listTransfers = (params) => axiosClient.get('/transfers', { params });
export const createTransfer = (payload) => axiosClient.post('/transfers', payload);
export const approveTransfer = (id) => axiosClient.patch(`/transfers/${id}/approve`);
export const rejectTransfer = (id, reason) => axiosClient.patch(`/transfers/${id}/reject`, { reason });
