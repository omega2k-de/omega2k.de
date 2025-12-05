import axios from 'axios';

module.exports = async function () {
  axios.defaults.baseURL = process?.env['API'] ?? 'https://localhost';
  axios.defaults.withCredentials = axios.defaults.baseURL?.startsWith('https://');
};
