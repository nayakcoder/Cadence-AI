import { Queue, QueueOptions } from "bullmq";

const defaultQueueOptions: QueueOptions = {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    maxRetriesPerRequest: null,
  } as any,
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
