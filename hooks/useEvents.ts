'use client'

import { useEffect, useState } from 'react'
import type { GenericEventType } from '../types'

export interface Event<T, D> {
	type: keyof GenericEventType
	data: D
	username?: string
	action?: T
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ClientEvent = Event<string, Record<string, any>>

export function useEvents({ id }: { id: string }) {
	const [events, setEvents] = useState<ClientEvent[]>([])

	useEffect(() => {
		if (!id) return

		const eventSource = new EventSource(`/api/events?id=${id}`)

		eventSource.onmessage = event => {
			try {
				const data = JSON.parse(event.data) as ClientEvent
				setEvents(prev => [...prev, data])
			} catch (error) {
				console.error('Error parsing event data:', error)
			}
		}

		// setEvents([
		// 	{
		// 		type: 'System',
		// 		action: 'connection_opened',
		// 		data: {},
		// 		username: 'System'
		// 	}
		// ])

		return () => {
			eventSource.close()
		}
	}, [id])

	return { events }
}
