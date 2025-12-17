import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://test-project-xpyo.onrender.com',
  //baseURL: 'http://localhost:5000',
  withCredentials: false,

});

export default axiosInstance;