'use strict';

import process from 'node:process';

const host = process?.env['HOST'] ?? 'localhost';
const port = Number(process?.env['PORT'] ?? 4000);
const url = process?.env['URL'] ?? `https://${host}:${port}`;
const api = process?.env['API'] ?? null;
const version = process?.env['VERSION'] ?? '0.42.86';

const onProxyReq = proxyReq => {
  proxyReq.setHeader('origin', url);
  proxyReq.setHeader('origin', url);
  proxyReq.setHeader('x-version', version);
};

export default [
  {
    context: ['/api'],
    pathRewrite: {
      '^/api': '',
    },
    target: api,
    secure: false,
    changeOrigin: true,
    withCredentials: true,
    logLevel: 'debug',
    onProxyReq,
  },
];
