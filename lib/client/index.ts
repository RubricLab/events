'use client'

import { useEffect } from 'react'
import { z } from 'zod/v4'
import type { GenericEvents } from '../types'

const dataSchema = z.object({
	eventType: z.string(),
	payload: z.any()
})

export function createEventsClient<EventTypes extends GenericEvents>({
	url,
	eventTypes
}: {
	url: string
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
				[key in EventTypeKeys]?: (props: z.infer<EventTypes[key]>) => void
			}
		}) {
			const connect = () => {
				const eventSource = new EventSource(`${url}?id=${id}`)

				eventSource.onmessage = ({ data }) => {
					const { eventType, payload } = dataSchema.parse(JSON.parse(data))

					if (!eventType || !eventTypes[eventType]) {
						throw `Unknown event: ${eventType}`
					}

					const safePayload = eventTypes[eventType].parse(payload) as z.infer<
						(typeof eventTypes)[typeof eventType]
					>
					on[eventType]?.(safePayload)
				}

				eventSource.onerror = e => {
					console.log('Error; reconnecting...')
					console.error(e)
					eventSource.close()
					setTimeout(connect, 1)
				}

				return eventSource
			}

			useEffect(() => {
				if (!id) return

				const eventSource = connect()

				return () => {
					eventSource.close()
				}
			}, [id])
		}
	}
}
