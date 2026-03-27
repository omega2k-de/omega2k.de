import axios from 'axios';

describe('API backend', () => {
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
    expect(res.data.version).toMatch(/^(?:[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?|[0-9a-f]{8})$/i);
    if (null !== res.data.hash) {
      expect(res.data.hash).toMatch(/^([0-9a-f]{8})$/i);
    }
  });

  it('GET /privacy should expose the cookies sent by the client', async () => {
    const res = await axios.get(`/privacy`, {
      headers: {
        Cookie: 'theme=light',
      },
    });

    expect(res.status).toStrictEqual(200);
    expect(res.data).toEqual({
      cookies: [{ key: 'theme', value: 'light' }],
    });
  });

  it('POST /likes/:articleId/toggle should create a cookie and persist like state', async () => {
    const articleId = Date.now();

    const toggleRes = await axios.post(`/likes/${articleId}/toggle`);

    expect(toggleRes.status).toStrictEqual(200);
    expect(toggleRes.data).toEqual({
      articleId,
      count: 1,
      liked: true,
    });

    const setCookie = toggleRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toHaveLength(1);

    const cookieHeader = setCookie?.[0];
    expect(cookieHeader).toContain('o2k_uid=');

    const cookie = cookieHeader?.split(';')[0];
    expect(cookie).toBeTruthy();

    const stateRes = await axios.get(`/likes/${articleId}`, {
      headers: {
        Cookie: cookie,
      },
    });

    expect(stateRes.status).toStrictEqual(200);
    expect(stateRes.data).toEqual({
      articleId,
      count: 1,
      liked: true,
    });

    const listRes = await axios.get(`/likes`, {
      headers: {
        Cookie: cookie,
      },
    });

    expect(listRes.status).toStrictEqual(200);
    expect(listRes.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          articleId,
          count: 1,
          liked: true,
        }),
      ])
    );
  });
});
