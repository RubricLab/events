"use client";

import { useEffect } from "react";
import { z } from "zod";
import type { GenericEvents } from "../types";

const dataSchema = z.object({
  eventType: z.string(),
  payload: z.any(),
});

export function createEventHooks<EventTypes extends GenericEvents>({
  eventTypes,
}: {
  eventTypes: EventTypes;
}) {
  type EventTypeKeys = keyof EventTypes;

  return {
    useEvents({
      id,
      on,
    }: {
      id: string;
      on: {
        [key in EventTypeKeys]: (props: z.infer<EventTypes[key]>) => void;
      };
    }) {
      useEffect(() => {
        if (!id) return;

        const eventSource = new EventSource(`/api/events?id=${id}`);

        eventSource.onmessage = ({ data }) => {
          const { eventType, payload } = dataSchema.parse(JSON.parse(data));

          if (!eventType || !eventTypes[eventType]) {
            throw `Unknown event: ${eventType}`;
          }

          const safePayload = eventTypes[eventType].parse(payload);

          on[eventType]?.(safePayload);
        };

        return () => {
          eventSource.close();
        };
      }, [id, eventTypes, on]);
    },
  };
}
