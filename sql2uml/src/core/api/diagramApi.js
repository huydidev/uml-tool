// src/core/api/diagramApi.js

import axiosClient from './axiosClient';

export const diagramApi = {
  // Tạo mới
  create: (payload) => axiosClient.post('/diagrams', payload),

  // Cập nhật
  update: (id, payload) => axiosClient.put(`/diagrams/${id}`, payload),

  // Lấy tất cả
  getAll: () => axiosClient.get('/diagrams'),

  // Lấy theo id
  getById: (id) => axiosClient.get(`/diagrams/${id}`),

  // Xóa
  delete: (id) => axiosClient.delete(`/diagrams/${id}`),
};