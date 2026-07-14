import axiosClient from './axiosClient';

export const listAudits = (params) => axiosClient.get('/audits', { params });
export const createAudit = (payload) => axiosClient.post('/audits', payload);
export const updateAuditItem = (auditId, itemId, payload) =>
  axiosClient.patch(`/audits/${auditId}/items/${itemId}`, payload);
export const closeAudit = (id, force = false) =>
  axiosClient.patch(`/audits/${id}/close`, { force });
export const getAuditDiscrepancies = (id) => axiosClient.get(`/audits/${id}/discrepancies`);
