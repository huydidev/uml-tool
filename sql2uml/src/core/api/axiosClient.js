import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Trỏ thẳng vào cổng Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;