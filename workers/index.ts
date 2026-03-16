import "./email-dispatch.worker";
import "./linkedin-outreach.worker";
import "./reply-processor.worker";
import "./follow-up-scheduler.worker";
import "./copy-generation.worker";
import "./reddit-outreach.worker";
import "./lead-enrichment.worker";

console.log("🚀 All Cadence AI workers started");

// Schedule the follow-up checker every 15 minutes
import { queues } from "../lib/queue/queues";

setInterval(() => {
  queues.followUpScheduler.add("check-all", { type: "check-all" }, {
    jobId: "follow-up-scheduler-singleton",
  }).then(() => {
    console.log("⏰ Follow-up scheduler triggered");
  }).catch((err) => {
    console.error("❌ Failed to enqueue follow-up scheduler job:", err);
  });
}, 15 * 60 * 1000);

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("Workers shutting down gracefully...");
  process.exit(0);
});