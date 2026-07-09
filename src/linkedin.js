require("dotenv").config();
const { chromium } = require("playwright");

async function loginLinkedIn() {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  // If the browser process dies unexpectedly (antivirus, crash, etc.)
  // you'll see this instead of a confusing locator timeout.
  browser.on("disconnected", () => {
    console.log("⚠️  Browser was disconnected/closed unexpectedly.");
    console.log(
      "    Common causes: antivirus killing the automated Chromium window,"
    );
    console.log(
      "    a crashed renderer, or `npx playwright install` not fully run."
    );
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  page.on("close", () => console.log("⚠️  Page was closed."));
  page.on("crash", () => console.log("⚠️  Page crashed."));

  console.log("Going to LinkedIn...");
  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "domcontentloaded",
  });

  console.log("Current URL:", page.url());
  console.log("Email:", process.env.LINKEDIN_EMAIL);
  console.log("Waiting for username field...");

  try {
    await page.locator("#username").waitFor({ state: "visible", timeout: 30000 });
    console.log("Username field found!");

    await page.locator("#username").fill(process.env.LINKEDIN_EMAIL);
    await page.locator("#password").fill(process.env.LINKEDIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    console.log("Clicked Sign In.");

    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // LinkedIn sometimes throws a "verify it's you" / captcha checkpoint.
    // We can't (and shouldn't) auto-solve that — just pause and let a human do it.
    if (page.url().includes("checkpoint")) {
      console.log(
        "⚠️  LinkedIn is showing a security checkpoint (captcha/2FA)."
      );
      console.log("    Please complete it manually in the open browser window.");
      await page
        .waitForURL("**/feed/**", { timeout: 120000 })
        .catch(() => console.log("    Still not past checkpoint after 2 min — continuing anyway."));
    }
  } catch (e) {
    console.log("FAILED during login.");
    console.error(e);
    if (!page.isClosed()) {
      await page.screenshot({ path: "linkedin-error.png", fullPage: true }).catch(() => {});
      console.log("Screenshot saved (if page was still open).");
    }
    throw e;
  }

  return { browser, context, page };
}

module.exports = loginLinkedIn;