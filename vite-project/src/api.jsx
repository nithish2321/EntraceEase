import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const login = (role, email, password) =>
  axios.post(`${API_URL}/${role}/login`, { email, password });

export const register = (role, data) =>
  axios.post(`${API_URL}/${role}/register`, data);

export const getProfile = (role, token) =>
  axios.get(`${API_URL}/${role}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (role, token, data) =>
  axios.put(`${API_URL}/${role}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTestCenters = () => axios.get(`${API_URL}/test-centers`);

export const bookTestCenter = (token, data) =>
  axios.post(`${API_URL}/bookings`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getBookingHistory = (token) =>
  axios.get(`${API_URL}/test-center/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAvailability = (token) =>
  axios.get(`${API_URL}/test-center/availability`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCollegeBookingHistory = (token) =>
  axios.get(`${API_URL}/college/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateBooking = (token, bookingId, data) =>
  axios.put(`${API_URL}/bookings/${bookingId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  export const assignTestCenters = async (token) => {
    return axios.post(
      'http://localhost:5000/api/assign-test-centers',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };
  
  export const getStudentAssignments = async (token) => {
    return axios.get('http://localhost:5000/api/student-assignments', {
      headers: { Authorization: `Bearer ${token}` },
    });
  };