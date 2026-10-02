import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    try {
      const res = await client.get('/health');
      return { success: true, data: res.data, status: 'ok', ...res.data };
    } catch (err) {
      return { success: false, error: err.message, status: 'offline' };
    }
  },

  getNeo4jHealth: async () => {
    try {
      const res = await client.get('/health/neo4j');
      const isConnected = res.data?.status === 'connected';
      return {
        success: isConnected,
        data: res.data,
        status: res.data?.status || 'disconnected',
        ...res.data,
      };
    } catch (err) {
      return { success: false, error: err.message, status: 'disconnected' };
    }
  },

  getStats: async () => {
    try {
      const res = await client.get('/api/stats');
      return { success: true, data: res.data, ...res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getBananaNodes: async () => {
    try {
      const res = await client.get('/api/banana');
      const nodes = Array.isArray(res.data) ? res.data : [];
      return {
        success: true,
        data: nodes,
        nodes,
        count: nodes.length,
        verified: nodes.length === 5,
      };
    } catch (err) {
      return { success: false, error: err.message, nodes: [], count: 0, verified: false };
    }
  },

  getGraphData: async () => {
    try {
      const res = await client.get('/api/graph');
      return { success: true, data: res.data, ...res.data };
    } catch (err) {
      return { success: false, error: err.message, data: { nodes: [], links: [] }, nodes: [], links: [] };
    }
  },

  getEntities: async () => {
    try {
      const res = await client.get('/api/entities');
      return { success: true, data: res.data, ...res.data };
    } catch (err) {
      return { success: false, error: err.message, data: {} };
    }
  },

  askQuestion: async (question) => {
    try {
      const res = await client.post('/api/ask', { question });
      return { success: true, data: res.data, ...res.data };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return { success: false, error: detail };
    }
  },
};

export const apiService = api;
export default api;
