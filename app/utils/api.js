import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function getHeaders() {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status
    );
  }
  
  return data;
}

export const api = {
  async get(endpoint) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  async post(endpoint, body) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async put(endpoint, body) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};