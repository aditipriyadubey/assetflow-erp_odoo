/**
 * client/src/api/axiosClient.js
 *
 * MISSING FILE — there was no client/src/api/ folder anywhere in the
 * ZIP. Despite axios being listed in client/package.json, it is never
 * imported anywhere; every page currently reads from client/src/utils/mock*.js
 * static arrays instead of the backend. This is the shared instance
 * every other api/*.js file should import (SDD §8/§9: "No component
 * calls fetch/axios directly — always via api/*.js").
 *
 * Token storage: the access token is kept in memory (React context)
 * per SDD §17, NOT localStorage — pass it in via setAccessToken()
 * from AuthContext after login/refresh. A 401 triggers exactly one
 * silent refresh-and-retry per request (SDD §17 step 5).
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({ baseURL });

let accessToken = null;
let onUnauthorized = null; // callback set by AuthContext (e.g. force logout)

export function setAccessToken(token) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = window.sessionStorage.getItem('assetflow_refresh_token');
        if (!refreshToken) throw error;

        const { data } = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(original);
      } catch (refreshErr) {
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
