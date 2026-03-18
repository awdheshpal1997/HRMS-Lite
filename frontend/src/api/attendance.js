import client from './client';

export const getAttendance = (params) => client.get('/attendance/', { params });
export const markAttendance = (data) => client.post('/attendance/', data);
