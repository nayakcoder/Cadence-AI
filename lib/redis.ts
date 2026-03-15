/**
 * Shared Redis connection configuration used by BullMQ queues and workers.
 * Centralizing this object avoids duplicating the URL-parsing logic in every
 * file and ensures all queues and workers share the same connection settings.
 */

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");

export const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  /** Required by BullMQ – disables the ioredis default of 3 retries so that
   *  BullMQ can control retry logic itself. */
  maxRetriesPerRequest: null as null,
};
