import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General limit for most API traffic
export const generalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  prefix: "ratelimit:general",
});

// Tighter limit for the payment-initiation route specifically — this one
// triggers a real external M-Pesa request per call, so it's the route most
// worth protecting against being hammered or abused.
export const paymentRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:payment",
});
