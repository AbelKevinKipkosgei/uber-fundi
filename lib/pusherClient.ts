"use client";

import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("pusherClient can only be used in the browser");
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
      },
    );
  }

  return pusherClientInstance;
}
