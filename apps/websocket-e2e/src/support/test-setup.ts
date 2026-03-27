import axios from 'axios';

module.exports = async function () {
  const port = process?.env['API_PORT'] ?? '42080';
  const configuredBaseUrl = process?.env['API'];
  axios.defaults.baseURL =
    configuredBaseUrl?.includes('localhost') || configuredBaseUrl?.includes('127.0.0.1')
      ? configuredBaseUrl
      : `https://127.0.0.1:${port}`;
  axios.defaults.withCredentials = axios.defaults.baseURL?.startsWith('https://');
};
