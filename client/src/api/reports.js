import axiosClient from './axiosClient';

export const getUtilizationReport = (params) => axiosClient.get('/reports/utilization', { params });
export const getMaintenanceFrequencyReport = (params) =>
  axiosClient.get('/reports/maintenance-frequency', { params });
export const getDueForMaintenanceReport = (params) =>
  axiosClient.get('/reports/due-for-maintenance', { params });
export const getDepartmentAllocationReport = (params) =>
  axiosClient.get('/reports/department-allocation', { params });
export const getBookingHeatmapReport = (params) =>
  axiosClient.get('/reports/booking-heatmap', { params });
export const exportReportCsv = (params) =>
  axiosClient.get('/reports/export', { params: { ...params, type: 'csv' }, responseType: 'blob' });
