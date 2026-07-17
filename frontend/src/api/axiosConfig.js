import axios from 'axios';
import { resolveApiBaseUrl } from './apiBase';

const baseURL = resolveApiBaseUrl();

const API = axios.create({
  baseURL,
  timeout: 30000,
});

export default API;
export { baseURL as API_BASE_URL };
