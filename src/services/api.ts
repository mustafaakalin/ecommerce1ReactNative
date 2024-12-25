// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecommerce1.akalin.tech:443/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});


const apioauth = axios.create({
  baseURL: 'https://ecommerce1.akalin.tech:443/admin/oauth',
  headers: {
    'Content-Type': 'application/json',
  },
});
const apisearch = axios.create({
  baseURL: 'https://ecommerce1.akalin.tech:443/api',
  headers: {
    'Content-Type': 'application/json',
  },
});




const apibaseweburl = axios.create({
  baseURL: 'https://ecommerce1.akalin.tech:443',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};


export {apioauth};
export {apisearch};
export {apibaseweburl};
export default api;