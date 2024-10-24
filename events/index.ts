import Redis from "ioredis";
import type { GenericEvents } from "../types";
import type { z } from "zod";

export function createEventActions<EventTypes extends GenericEvents>({
  redisURL,
  eventTypes,
}: {
  redisURL: string;
  eventTypes: EventTypes;
}) {
  type EventTypeKeys = keyof typeof eventTypes;

  const publisher = new Redis(redisURL);

  return {
    async publish<EventTypeKey extends EventTypeKeys>({
      channel,
      eventType,
      payload,
    }: {
      channel: string;
      eventType: EventTypeKey;
      payload: z.infer<EventTypes[EventTypeKey]>;
    }) {
      publisher.publish(channel, JSON.stringify({ eventType, payload }));
    },
  };
}

export function createEventsHandler({ redisURL }: { redisURL: string }) {
  const subscriber = new Redis(redisURL);

  return {
    async eventsHandler(req: Request): Promise<Response> {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) return new Response("No id provided", { status: 400 });

      const { writable, readable } = new TransformStream();
      const writer = writable.getWriter();

      const encoder = new TextEncoder();

      const listener = async (channel: string, message: string) => {
        if (channel === id) {
          await writer.write(encoder.encode(`data: ${message}\n\n`));
        }
      };

      subscriber.subscribe(id);
      subscriber.on("message", listener);

      req.signal.addEventListener("abort", () => {
        subscriber.unsubscribe(id);
        subscriber.off("message", listener);
        writer.close();
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  };
}
