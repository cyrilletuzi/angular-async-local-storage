import { browser, $ } from 'protractor';

describe('interoperability', () => {

  it('compatibility with localforage lib', (done) => {

    browser.get('/').then(() => {
      /* Wait for a few seconds as operations are asynchronous */
      setTimeout(() => {
        $('h1').getText().then((title) => {
          expect(title).toBe('hello world');
          done();
        }).catch(() => {
          fail();
        });
      }, 1000);
    }).catch(() => {
      fail();
    });

  });

  it('lazy loading', (done) => {

    browser.get('/').then(() => {
      /* Wait for a few seconds as operations are asynchronous */
      setTimeout(() => {
        browser.get('/lazy').then(() => {
          /* Wait for a few seconds as operations are asynchronous */
          setTimeout(() => {
            $('#lazy').getText().then((title) => {
              expect(title).toBe('hello world');
              done();
            }).catch(() => {
              fail();
            });
          }, 1000);
        }).catch(() => {
          fail();
        });
      }, 1000);
    }).catch(() => {
      fail();
    });

  });

});
