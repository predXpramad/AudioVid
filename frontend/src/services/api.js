import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const uploadFiles = async (audioFiles, imageFile, onUploadProgress) => {
  const formData = new FormData();
  audioFiles.forEach((file) => {
    formData.append('audio_files', file);
  });
  formData.append('image', imageFile);

  const response = await api.post('/convert/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const getJobStatus = async (jobId) => {
  const response = await api.get(`/status/${jobId}`);
  return response.data;
};

export const cancelJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const downloadVideo = async (jobId) => {
  // Return the URL directly to trigger a browser download
  return `${API_URL}/download/${jobId}/zip`;
};
