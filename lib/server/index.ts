import Redis from 'ioredis'
import type { z } from 'zod/v4'
import { MAX_DURATION } from '../constants'
import type { GenericEvents } from '../types'

export function createEventsServer<EventTypes extends GenericEvents>({
	redisURL,
	eventTypes
}: {
	redisURL: string
	eventTypes: EventTypes
}) {
	type EventTypeKeys = keyof typeof eventTypes

	const subscriber = new Redis(redisURL)

	const publisher = new Redis(redisURL)

	async function publish<EventTypeKey extends EventTypeKeys>({
		channel,
		eventType,
		payload
	}: {
		channel: string
		eventType: EventTypeKey
		payload: z.infer<EventTypes[EventTypeKey]>
	}) {
		publisher.publish(channel, JSON.stringify({ eventType, payload }))
	}

	async function GET(req: Request): Promise<Response> {
		const { searchParams } = new URL(req.url)

		const id = searchParams.get('id')

		if (!id) return new Response('No ID provided', { status: 400 })

		const { writable, readable } = new TransformStream()

		const writer = writable.getWriter()

		const encoder = new TextEncoder()

		const listener = async (channel: string, message: string) => {
			if (channel !== id) return
			await writer.write(encoder.encode(`data: ${message}\n\n`))
		}

		subscriber.subscribe(id)

		subscriber.on('message', listener)

		req.signal.addEventListener('abort', () => {
			subscriber.unsubscribe(id)
			subscriber.off('message', listener)
			writer.close()
		})

		return new Response(readable, {
			headers: {
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'Content-Type': 'text/event-stream'
			}
		})
	}

	return {
		GET,
		maxDuration: MAX_DURATION,
		publish
	}
}
