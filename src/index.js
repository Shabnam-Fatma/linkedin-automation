require("dotenv").config();
const path = require("path");
const loginLinkedIn = require("./linkedin");
const searchJobs = require("./searchJobs");
const sendApplicationEmail = require("./gmail");

const candidate = {
  name: "Your Name",
  email: process.env.GMAIL_EMAIL,
  phone: "+1-555-555-5555",
  resumePath: path.resolve(__dirname, "../resume.pdf"),
  autoSend: false, // flip to true only after checking a few drafts look right
};

(async () => {
  let browser;
  try {
    console.log("Starting automation...");

    const login = await loginLinkedIn();
    browser = login.browser;
    const { context, page } = login;

    console.log("Logged in to LinkedIn.");

    const jobs = await searchJobs(page, "Java Developer Contract");
    console.log(`Found ${jobs.length} matching posts with recruiter emails.`);

    for (const job of jobs) {
      console.log(`→ ${job.author} | ${job.recruiterEmail} | ${job.postedAgo}`);
      await sendApplicationEmail(context, job, candidate);
    }

    console.log("Done.");
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  } finally {
    // Left open on purpose so you can inspect results/drafts.
    // Uncomment when you're ready to auto-close:
    // if (browser) await browser.close();
  }
})();