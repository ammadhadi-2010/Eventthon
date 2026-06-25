import axios from 'axios';

const rawBase =
  process.env.REACT_APP_API_BASE_URL ||
  'http://127.0.0.1:8000';

const baseURL = String(rawBase).replace(/\/+$/, '');

const API = axios.create({
  baseURL,
  timeout: 30000,
});

export default API;
export { baseURL as API_BASE_URL };