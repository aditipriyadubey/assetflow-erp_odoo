import axiosClient from './axiosClient';

export const listAllocations = (params) => axiosClient.get('/allocations', { params });
export const createAllocation = (payload) => axiosClient.post('/allocations', payload);

// NOTE: SDD §14.6 specifies `POST /allocations/:id/return`. The backend
// allocations module as delivered only exposes a generic `PATCH /:id`
// instead — see the audit report's Phase 3 findings. This call targets
// the SDD-specified endpoint; add the dedicated `/return` route to
// server/src/modules/allocations/routes.js (mapping to a new
// `returnAllocation` service function that sets status='Returned',
// actual_return_date=NOW(), and flips the asset back to 'Available')
// before this will work end-to-end.
export const returnAllocation = (id, conditionCheckinNotes) =>
  axiosClient.post(`/allocations/${id}/return`, { condition_checkin_notes: conditionCheckinNotes });
