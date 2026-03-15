import { Queue, QueueOptions } from "bullmq";
import { redisConnection as connection } from "@/lib/redis";

const defaultQueueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
};

export const queues = {
  leadEnrichment: new Queue("lead-enrichment", defaultQueueOptions),
  copyGeneration: new Queue("copy-generation", defaultQueueOptions),
  linkedinOutreach: new Queue("linkedin-outreach", defaultQueueOptions),
  emailDispatch: new Queue("email-dispatch", defaultQueueOptions),
  redditOutreach: new Queue("reddit-outreach", defaultQueueOptions),
  replyProcessor: new Queue("reply-processor", defaultQueueOptions),
  followUpScheduler: new Queue("follow-up-scheduler", defaultQueueOptions),
};

export type QueueName = keyof typeof queues;