import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.9:3000/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('assistdoc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (__DEV__) console.log(`[AssistDoc] ${String(config.method).toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('assistdoc_token');
      await SecureStore.deleteItemAsync('assistdoc_user');
    }
    if (__DEV__) console.log('[AssistDoc API ERROR]', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export async function checkServer() {
  const url = API_URL.replace(/\/api$/, '') + '/health';
  return axios.get<{ success: boolean; server: string; database: string }>(url, { timeout: 6000 });
}
export default api;
