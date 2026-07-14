import axiosClient from './axiosClient';

export const listUsers = (params) => axiosClient.get('/users', { params });
export const getUser = (id) => axiosClient.get(`/users/${id}`);
export const updateUser = (id, payload) => axiosClient.patch(`/users/${id}`, payload);
export const changeUserRole = (id, role) => axiosClient.patch(`/users/${id}/role`, { role });
export const deactivateUser = (id) => axiosClient.patch(`/users/${id}/deactivate`);
