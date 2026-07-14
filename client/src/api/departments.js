import axiosClient from './axiosClient';

export const listDepartments = (params) => axiosClient.get('/departments', { params });
export const createDepartment = (payload) => axiosClient.post('/departments', payload);
export const updateDepartment = (id, payload) => axiosClient.put(`/departments/${id}`, payload);
export const setDepartmentStatus = (id, status) =>
  axiosClient.patch(`/departments/${id}/status`, { status });
