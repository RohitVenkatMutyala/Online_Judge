// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Your backend URL

export const register = async (formData) => {
  return axios.post(`${API_URL}/register`, formData);
};

export const login = async (formData) => {
  return axios.post(`${API_URL}/login`, formData);
};
