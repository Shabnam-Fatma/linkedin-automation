async function searchJobs(page, keyword) {
  console.log("Searching jobs...");

  await page.goto("https://www.linkedin.com/jobs");

  await page.waitForLoadState("networkidle");

  const searchBox = page.locator(
    'input[aria-label="Search by title, skill, or company"]'
  );

  await searchBox.fill(keyword);

  await page.keyboard.press("Enter");

  await page.waitForTimeout(5000);

  console.log("Search completed.");
}

module.exports = searchJobs;