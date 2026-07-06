const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const page = await browser.newPage();

  await page.goto("https://example.com");

  console.log(await page.title());

  await page.waitForTimeout(5000);

  await browser.close();
})();