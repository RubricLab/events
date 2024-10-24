'use client'

import { useEffect } from 'react'
import type { ZodType, z } from 'zod'

type GenericEvents = Record<string, ZodType>

export function createEventHooks<EventTypes extends GenericEvents>({
	eventTypes
}: { eventTypes: EventTypes }) {
	return {
		useEvents({
			id,
			events,
			on
		}: {
			id: string
			events: (keyof typeof eventTypes)[]
			on: { [key in keyof typeof eventTypes]: (props: z.infer<(typeof eventTypes)[key]>) => void }
		}) {
			useEffect(() => {
				if (!id) return

				const eventSource = new EventSource(`/api/events?id=${id}`)

				eventSource.onmessage = ({ data: { eventType, payload } }) => {
					if (!eventTypes[eventType]) {
						throw 'event'
					}
					if (!events.includes(eventType)) {
						throw 'event not registered'
					}
					const callback = on[eventType]
					if (callback) {
						callback(payload)
					}
				}

				return () => {
					eventSource.close()
				}
			}, [id, eventTypes, on, events])
		}
	}
}

// const { useEvents } = createEventHooks({
// 	eventTypes: {
// 		stockPriceChange: z.object({
// 			ticker: z.string(),
// 			price: z.number()
// 		}),
// 		sendMessage: z.object({
// 			message: z.string()
// 		})
// 	}
// })
