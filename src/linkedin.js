require("dotenv").config();
const { chromium } = require("playwright");

async function loginLinkedIn() {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const page = await browser.newPage();

  console.log("Going to LinkedIn...");

  await page.goto("https://www.linkedin.com/login");

  console.log("Current URL:", page.url());

  console.log("Email:", process.env.LINKEDIN_EMAIL);

  console.log("Waiting for username field...");

  try {
    await page.locator("#username").waitFor({
      state: "visible",
      timeout: 15000,
    });

    console.log("Username field found!");

    await page.locator("#username").fill(process.env.LINKEDIN_EMAIL);

    console.log("Email filled.");

    await page.locator("#password").fill(process.env.LINKEDIN_PASSWORD);

    console.log("Password filled.");

    await page.locator('button[type="submit"]').click();

    console.log("Clicked Sign In.");

  } catch (e) {
    console.log("FAILED");
    console.error(e);

    await page.screenshot({ path: "linkedin-error.png", fullPage: true });

    console.log("Screenshot saved.");

    throw e;
  }

  return { browser, page };
}

module.exports = loginLinkedIn;