import { mockJackpotData } from './mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || !API_URL;

async function fetchWithFallback(endpoint: string) {
  if (USE_MOCK) {
    console.log('Using mock data for:', endpoint);
    return mockJackpotData;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log('API Error, falling back to mock data');
    return mockJackpotData;
  }
}

export const api = {
  getJackpots: () => fetchWithFallback('/jackpots'),
  // ...existing code...
};
