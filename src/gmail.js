// Logs into Gmail (if needed) and composes an email to the recruiter with
// the resume attached.
//
// IMPORTANT: Google actively blocks sign-ins from automated browsers
// ("This browser or app may not be secure"). If loginGmail() gets stuck
// there, the more reliable fix is to switch to the Gmail API with OAuth2
// instead of driving the Gmail web UI. This version is kept consistent
// with the rest of your Playwright-based project, but treat it as the
// "best effort" path, not a guaranteed one.

async function sendApplicationEmail(context, job, candidate) {
  const page = await context.newPage();

  console.log(`Opening Gmail to email ${job.recruiterEmail}...`);
  await page.goto("https://mail.google.com/mail/u/0/#inbox", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3000);

  if (page.url().includes("accounts.google.com")) {
    console.log("Not logged into Gmail. Logging in...");
    await loginGmail(page);
  }

  console.log("Composing new email...");
  await page.locator('div.T-I.T-I-KE.L3').click(); // "Compose" button
  await page.waitForTimeout(1500);

  await page.locator('textarea[name="to"]').fill(job.recruiterEmail);
  await page
    .locator('input[name="subjectbox"]')
    .fill("Application for Java Developer (Contract) Position");

  const body = buildEmailBody(candidate, job);
  await page.locator('div[aria-label="Message Body"]').fill(body);

  // Attach resume via the paperclip icon
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.locator('div[command="Files"]').click(),
  ]);
  await fileChooser.setFiles(candidate.resumePath);
  await page.waitForTimeout(3000); // let the upload finish

  if (candidate.autoSend) {
    await page.locator('div[aria-label*="Send"]').first().click();
    console.log(`✅ Email sent to ${job.recruiterEmail}`);
    await page.close();
  } else {
    console.log(
      `📝 Draft prepared for ${job.recruiterEmail} — left open for your review (autoSend is off).`
    );
    // Deliberately not closing the page here so you can eyeball the draft.
  }
}

async function loginGmail(page) {
  await page.locator('input[type="email"]').fill(process.env.GMAIL_EMAIL);
  await page.locator("#identifierNext").click();
  await page.waitForTimeout(2000);

  await page.locator('input[type="password"]').fill(process.env.GMAIL_PASSWORD);
  await page.locator("#passwordNext").click();
  await page.waitForTimeout(4000);

  if (page.url().includes("challenge")) {
    console.log(
      "⚠️  Google is asking for 2FA/verification — complete it manually in the browser window."
    );
    await page.waitForURL("**/mail.google.com/**", { timeout: 120000 });
  }
}

function buildEmailBody(candidate, job) {
  return `Dear Hiring Team,

I hope this message finds you well. My name is ${candidate.name}, and I came across your recent post regarding a Java Developer (Contract) opportunity.

I have attached my resume for your review, and I would welcome the opportunity to discuss how my background aligns with your requirements.

Please let me know if you need any additional information.

Best regards,
${candidate.name}
${candidate.phone || ""}
${candidate.email || ""}`;
}

module.exports = sendApplicationEmail;