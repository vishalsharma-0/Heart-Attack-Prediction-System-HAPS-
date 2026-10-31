import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const fetchSchema = async () => {
  const res = await api.get('/model/schema');
  return res.data;
};

export const fetchMetrics = async () => {
  const res = await api.get('/model/metrics');
  return res.data;
};

export const predictRisk = async (features) => {
  const res = await api.post('/predict', { features });
  return res.data;
};

export const fetchPredictions = async (riskLevel = '', page = 0, size = 10) => {
  const params = { page, size };
  if (riskLevel && riskLevel !== 'ALL') {
    params.riskLevel = riskLevel;
  }
  const res = await api.get('/predictions', { params });
  return res.data;
};

export const fetchPredictionById = async (id) => {
  const res = await api.get(`/predictions/${id}`);
  return res.data;
};

export const deletePrediction = async (id) => {
  await api.delete(`/predictions/${id}`);
};

export const fetchDatasetSummary = async () => {
  const res = await api.get('/dataset/summary');
  return res.data;
};

export const fetchFeatureAnalysis = async () => {
  const res = await api.get('/analysis/features');
  return res.data;
};

export default api;
