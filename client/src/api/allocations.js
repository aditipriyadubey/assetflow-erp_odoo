import api from './client';

export async function listAllocations() {
  const response = await api.get('/allocations');
  return response.data?.data ?? [];
}

export async function createAllocation(payload) {
  const response = await api.post('/allocations', payload);
  return response.data?.data;
}

export async function updateAllocation(id, payload) {
  const response = await api.patch(`/allocations/${id}`, payload);
  return response.data?.data;
}

export async function deleteAllocation(id) {
  const response = await api.delete(`/allocations/${id}`);
  return response.data?.data;
}

export async function listAssets() {
  const response = await api.get('/assets');
  return response.data?.data ?? [];
}

export async function listUsers() {
  const response = await api.get('/users');
  return response.data?.data ?? [];
}

export async function listTransfers() {
  const response = await api.get('/transfers');
  return response.data?.data ?? [];
}

export async function createTransfer(payload) {
  const response = await api.post('/transfers', payload);
  return response.data?.data;
}

export async function approveTransfer(id) {
  const response = await api.patch(`/transfers/${id}/approve`);
  return response.data?.data;
}

export async function rejectTransfer(id) {
  const response = await api.patch(`/transfers/${id}/reject`);
  return response.data?.data;
}
