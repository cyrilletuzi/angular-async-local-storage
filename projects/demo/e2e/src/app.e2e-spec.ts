import { browser, $ } from 'protractor';

describe('public api', () => {

  beforeAll((done) => {

    browser.get('/').then(() => {

      /* Wait for a few seconds as operations are asynchronous */
      setTimeout(() => {
        done();
      }, 1000);

    }).catch(() => {
      fail();
    });

  });

  it('getItem()', async () => {

    const data = await $('#get-item').getText();

    expect(data).toBe('hello world');

  });

  it('schema error', async () => {

    const data = await $('#schema-error').getText();

    expect(data).toBe('schema error');

  });

  it('removeItem()', async () => {

    const data = await $('#remove-item').getText();

    expect(data).toBe('');

  });

  it('clear()', async () => {

    const data = await $('#clear').getText();

    expect(data).toBe('');

  });

  it('length', async () => {

    const data = Number.parseInt(await $('#length').getText(), 10);

    expect(data).toBeGreaterThan(1);

  });

  it('keys()', async () => {

    const data = (await $('#keys').getText()).split(',');

    expect(data.length).toBeGreaterThan(1);

  });

  it('has', async () => {

    const data = await $('#has').getAttribute('hidden');

    expect(data).toBe('true');

  });

  it('service', async () => {

    const data = await $('#service').getText();

    expect(data).toBe('service');

  });

});
