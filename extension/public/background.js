importScripts('browser-polyfill.js');

browser.action.onClicked.addListener(() => {
  browser.tabs.create({ url: 'index.html' });
});