import { browser, $ } from 'protractor';

describe('public api', () => {

  beforeAll(async () => {

    await browser.get('/');

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

  it('size()', async () => {

    const data = Number.parseInt(await $('#size').getText(), 10);

    expect(data).not.toBeNaN();

  });

  it('length', async () => {

    const data = Number.parseInt(await $('#length').getText(), 10);

    expect(data).not.toBeNaN();

  });

  it('keys()', async () => {

    const data = await $('#keys').getText();

    expect(data).not.toBe('');

  });

  it('has', async () => {

    const data = await $('#has').getAttribute('hidden');

    expect(data).toBe('true');

  });

});
