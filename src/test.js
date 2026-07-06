const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const page = await browser.newPage();

  await page.goto("https://www.linkedin.com/login");

  console.log("Title:", await page.title());

  console.log("Username inputs:", await page.locator("#username").count());

  await page.waitForTimeout(10000);

  await browser.close();
})();