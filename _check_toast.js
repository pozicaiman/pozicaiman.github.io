const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:4000/2026/09/24/DL/', { waitUntil: 'load', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  await page.click('#menuShare');
  await new Promise(r => setTimeout(r, 300));
  const after = await page.evaluate(() => {
    const toasts = document.querySelectorAll('.copy-toast');
    const list = Array.from(toasts).map(t => ({
      text: t.textContent,
      cls: t.className,
      opacity: getComputedStyle(t).opacity,
      top: t.getBoundingClientRect().top,
    }));
    return { toastCount: toasts.length, toasts: list, errs: errs.length };
  });
  fs.writeFileSync('_toast_result.json', JSON.stringify(after, null, 2));
  await browser.close();
})();
