// Searches the LinkedIn POSTS/content feed (not the Jobs tab) for posts
// matching a keyword, posted in the last 24 hours, that contain an email address.
//
// NOTE: LinkedIn's class names are obfuscated/dynamic and change over time.
// If selectors below stop matching, right-click a post in the browser ->
// Inspect, and update the locator strings accordingly.

async function searchJobs(page, keyword) {
  console.log(`Searching posts for "${keyword}"...`);

  const url = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(
    keyword
  )}&sortBy=%22date_posted%22`;

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Scroll to trigger LinkedIn's lazy-loading of more posts
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1500);
  }

  const posts = await page.locator("div.feed-shared-update-v2").all();
  console.log(`Found ${posts.length} posts on page, filtering...`);

  const results = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const keywordsToMatch = keyword.toLowerCase().split(" ");

  for (const post of posts) {
    try {
      const timeText = await post
        .locator("span.update-components-actor__sub-description")
        .first()
        .innerText()
        .catch(() => "");

      if (!isWithinLast24Hours(timeText)) continue;

      const bodyText = await post
        .locator("div.update-components-text")
        .first()
        .innerText()
        .catch(() => "");

      const lowerText = bodyText.toLowerCase();
      const matchesKeywords = keywordsToMatch.every((k) => lowerText.includes(k));
      const emails = bodyText.match(emailRegex);

      if (matchesKeywords && emails && emails.length > 0) {
        const authorName = await post
          .locator("span.update-components-actor__name")
          .first()
          .innerText()
          .catch(() => "Unknown");

        results.push({
          author: authorName.trim(),
          recruiterEmail: emails[0],
          postText: bodyText.trim(),
          postedAgo: timeText.trim(),
        });
      }
    } catch (e) {
      continue; // skip any post that doesn't parse cleanly
    }
  }

  console.log(`Matched ${results.length} posts with keyword + email.`);
  return results;
}

// Parses LinkedIn's relative time strings: "5m", "23h", "1d", "2w", "3mo" ...
function isWithinLast24Hours(timeText) {
  if (!timeText) return false;
  const match = timeText.toLowerCase().match(/(\d+)\s*(m|h|d|w|mo|yr)/);
  if (!match) return false;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === "m") return true; // minutes ago -> always within 24h
  if (unit === "h") return value <= 24;
  if (unit === "d") return value <= 1;
  return false; // weeks/months/years -> too old
}

module.exports = searchJobs;