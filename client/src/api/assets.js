import axiosClient from './axiosClient';

export const listAssets = (params) => axiosClient.get('/assets', { params });
export const getAsset = (id) => axiosClient.get(`/assets/${id}`);
export const createAsset = (payload) => axiosClient.post('/assets', payload);
export const updateAsset = (id, payload) => axiosClient.put(`/assets/${id}`, payload);
export const getAssetHistory = (id) => axiosClient.get(`/assets/${id}/history`);
export const setAssetStatus = (id, status) => axiosClient.patch(`/assets/${id}/status`, { status });
