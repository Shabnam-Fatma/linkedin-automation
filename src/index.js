const loginLinkedIn = require("./linkedin");
const searchJobs = require("./searchJobs");

(async () => {
  try {
    console.log("Starting automation...");

    const { browser, page } = await loginLinkedIn();

    console.log("Logged in.");

    await searchJobs(page, "Java Developer Contract");

    console.log("Done.");
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
})();