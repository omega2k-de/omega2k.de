import axios from 'axios';

describe('API backend', () => {
  // it('GET /content should return content page', async () => {
  //   const res = await axios.get(`/content`);
  //
  //   expect(res.status).toStrictEqual(200);
  // });

  it('GET /_health should return a message', async () => {
    const res = await axios.get(`/_health`);

    expect(res.status).toStrictEqual(200);
    expect(res.headers['content-type']).toStrictEqual('application/json; charset=utf-8');
    expect(res.data.message).toEqual('OK');
    expect(res.data.uptime).toBeGreaterThan(0);
    expect(res.data.usage).toBeInstanceOf(Object);
    expect(res.data.usage['rss']).toBeGreaterThan(0);
    expect(res.data.usage['heapTotal']).toBeGreaterThan(0);
    expect(res.data.usage['heapUsed']).toBeGreaterThan(0);
    expect(res.data.usage['external']).toBeGreaterThan(0);
    expect(res.data.usage['arrayBuffers']).toBeGreaterThan(0);
    expect(res.data.version).toMatch(/^([0-9]+\.[0-9]+\.[0-9]+)$/i);
    if (null !== res.data.hash) {
      expect(res.data.hash).toMatch(/^([0-9a-f]{8})$/i);
    }
  });
});
