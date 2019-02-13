import { browser, $ } from 'protractor';

describe('interoperability', () => {

  it('compatibility with localforage lib', async () => {

    await browser.get('/');

    const title = await $('h1').getText();

    expect(title).toBe('hello world');

  });

});
