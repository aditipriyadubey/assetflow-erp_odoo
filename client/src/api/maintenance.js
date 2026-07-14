import axiosClient from './axiosClient';

export const listMaintenanceRequests = (params) => axiosClient.get('/maintenance', { params });
export const createMaintenanceRequest = (payload) => axiosClient.post('/maintenance', payload);
export const approveMaintenance = (id) => axiosClient.patch(`/maintenance/${id}/approve`);
export const rejectMaintenance = (id, reason) =>
  axiosClient.patch(`/maintenance/${id}/reject`, { reason });
export const assignTechnician = (id, technicianName) =>
  axiosClient.patch(`/maintenance/${id}/assign-technician`, { technician_name: technicianName });
export const startMaintenance = (id) => axiosClient.patch(`/maintenance/${id}/start`);
export const resolveMaintenance = (id) => axiosClient.patch(`/maintenance/${id}/resolve`);
