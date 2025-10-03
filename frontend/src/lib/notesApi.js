import api from './api';

export const fetchNotes = (params) => api.get('/notes', { params }); // { q, page, limit, sort }
export const getNote = (id) => api.get(`/notes/${id}`);
export const createNote = (payload) => api.post('/notes', payload);
export const updateNote = (id, payload) => api.put(`/notes/${id}`, payload);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
