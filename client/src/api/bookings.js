import axiosClient from './axiosClient';

export const listBookings = (params) => axiosClient.get('/bookings', { params });
export const getBooking = (id) => axiosClient.get(`/bookings/${id}`);
export const createBooking = (payload) => axiosClient.post('/bookings', payload);
export const cancelBooking = (id) => axiosClient.patch(`/bookings/${id}/cancel`);
export const rescheduleBooking = (id, payload) =>
  axiosClient.patch(`/bookings/${id}/reschedule`, payload);
