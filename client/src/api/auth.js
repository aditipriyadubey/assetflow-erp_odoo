import axiosClient from './axiosClient';

export const signup = (payload) => axiosClient.post('/auth/signup', payload);
export const login = (payload) => axiosClient.post('/auth/login', payload);
export const forgotPassword = (payload) => axiosClient.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => axiosClient.post('/auth/reset-password', payload);
export const refreshToken = (payload) => axiosClient.post('/auth/refresh-token', payload);
export const getMe = () => axiosClient.get('/auth/me');
