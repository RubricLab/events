'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { MAX_DURATION } from '../constants'
import type { GenericEvents } from '../types'

const dataSchema = z.object({
	eventType: z.string(),
	payload: z.any()
})

export function createEventsClient<EventTypes extends GenericEvents>({
	eventTypes
}: {
	eventTypes: EventTypes
}) {
	type EventTypeKeys = keyof EventTypes

	return {
		useEvents({
			id,
			on
		}: {
			id: string
			on: {
				[key in EventTypeKeys]: (props: z.infer<EventTypes[key]>) => void
			}
		}) {
			// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
			useEffect(() => {
				if (!id) return

				let eventSource: EventSource

				const connect = () => {
					// Don't recreate if we already have an open connection
					if (eventSource?.readyState === EventSource.OPEN) return

					// Close existing connection if it exists
					if (eventSource) eventSource.close()

					eventSource = new EventSource(`/api/events?id=${id}`)

					eventSource.onmessage = ({ data }) => {
						const { eventType, payload } = dataSchema.parse(JSON.parse(data))

						if (!eventType || !eventTypes[eventType]) {
							throw `Unknown event: ${eventType}`
						}

						const safePayload = eventTypes[eventType].parse(payload)
						on[eventType]?.(safePayload)
					}

					eventSource.onerror = e => {
						console.log('error; reconnecting...')
						console.error(e)
						eventSource.close()
					}
				}

				connect()

				// Only ping to keep the connection alive
				const keepAliveInterval = setInterval(() => {
					if (eventSource?.readyState !== EventSource.OPEN) {
						connect()
					}
				}, MAX_DURATION * 1000)

				// Cleanup function
				return () => {
					if (eventSource) eventSource.close()
					clearInterval(keepAliveInterval)
				}
			}, [id])
		}
	}
}
