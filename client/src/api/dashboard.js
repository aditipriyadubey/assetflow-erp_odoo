import axiosClient from './axiosClient';

export const getDashboardKpis = () => axiosClient.get('/dashboard/kpis');
export const getOverdueReturns = () => axiosClient.get('/dashboard/overdue');
