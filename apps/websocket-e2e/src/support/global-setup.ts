import { waitForPortOpen } from '@nx/node/utils';

module.exports = async function () {
  const port = Number(process?.env['API_PORT'] ?? '42080');
  await waitForPortOpen(port);
};
