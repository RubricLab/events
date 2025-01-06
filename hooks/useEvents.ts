'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { MAX_DURATION } from '../constants'
import type { GenericEvents } from '../types'

const dataSchema = z.object({
	eventType: z.string(),
	payload: z.any()
})

export function createEventHooks<EventTypes extends GenericEvents>({
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
			useEffect(() => {
				if (!id) return

				let eventSource: EventSource
				let reconnectTimeout: number

				const connect = () => {
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

					eventSource.onerror = () => {
						eventSource.close()
						// Attempt to reconnect after 5 seconds
						reconnectTimeout = setTimeout(connect, 5 * 1000) as unknown as number
					}
				}

				connect()

				const reconnectInterval = setInterval(() => {
					if (eventSource.readyState === EventSource.OPEN) {
						connect()
					}
				}, MAX_DURATION * 1000)

				return () => {
					eventSource.close()
					clearTimeout(reconnectTimeout)
					clearInterval(reconnectInterval)
				}
			}, [id, eventTypes, on])
		}
	}
}
