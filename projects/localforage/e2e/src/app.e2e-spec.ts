import { browser, $ } from 'protractor';

describe('interoperability', () => {

  it('compatibility with localforage lib', async () => {

    await browser.get('/');

    const title = await $('h1').getText();

    expect(title).toBe('hello world');

  });

  it('lazy loading', async () => {

    await browser.get('/');

    await browser.get('/lazy');

    const text = await $('#lazy').getText();

    expect(text).toBe('hello world');

  });

});
