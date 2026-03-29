module.exports = async function () {
  const port = process?.env['API_PORT'] ?? '42080';
  const configuredBaseUrl = process?.env['API'];
  process.env['WEBSOCKET_E2E_BASE_URL'] =
    configuredBaseUrl?.includes('localhost') || configuredBaseUrl?.includes('127.0.0.1')
      ? configuredBaseUrl
      : `https://127.0.0.1:${port}`;
};
