import Redis from 'ioredis'
import type { GenericEventType } from '../types'

// export class EventDispatcher<EventType extends GenericEventType> {
// 	subscriber: Redis
// 	publisher: Redis

// 	constructor({ redisURL }: { redisURL: string }) {
// 		this.subscriber = new Redis(redisURL)
// 		this.publisher = new Redis(redisURL)
// 	}

// 	async send<EventInstance extends Exclude<keyof EventType, number | symbol>>(
// 		channel: EventInstance,
// 		event: EventType[EventInstance]
// 	) {
// 		console.log('Not implemented')
// 		console.log(channel, event)

// 		// await fetch('/api/core', {
// 		// 	method: 'POST',
// 		// 	body: JSON.stringify({
// 		// 		message: JSON.stringify(event) // TODO: match event type to target
// 		// 	})
// 		// })

// 		// await eventHandlers[action]?.(data, username)
// 	}

// 	async publish<EventInstance extends Exclude<keyof EventType, number | symbol>>(
// 		channel: string,
// 		event: EventType[EventInstance]
// 	) {
// 		this.publisher.publish(channel, JSON.stringify(event))
// 	}

// 	subscribe<EventInstance extends Exclude<keyof EventType, number | symbol>>(
// 		channel: EventInstance,
// 		_callback: (event: EventType[EventInstance]) => void
// 	) {
// 		console.log('Not implemented')
// 		console.log(channel)
// 	}

// 	async handler(req: Request): Promise<Response> {
// 		const { searchParams } = new URL(req.url)
// 		const id = searchParams.get('id')

// 		if (!id) return new Response('No id provided', { status: 400 })

// 		const { writable, readable } = new TransformStream()
// 		const writer = writable.getWriter()

// 		const encoder = new TextEncoder()

// 		const listener = async (channel: string, message: string) => {
// 			if (channel === id) {
// 				await writer.write(encoder.encode(`data: ${message}\n\n`))
// 			}
// 		}

// 		console.log('YOO')

// 		console.log(this.subscriber)

// 		this.subscriber.subscribe(id)
// 		this.subscriber.on('message', listener)

// 		req.signal.addEventListener('abort', () => {
// 			this.subscriber.unsubscribe(id)
// 			this.subscriber.off('message', listener)
// 			writer.close()
// 		})

// 		return new Response(readable, {
// 			headers: {
// 				'Content-Type': 'text/event-stream',
// 				'Cache-Control': 'no-cache',
// 				Connection: 'keep-alive'
// 			}
// 		})
// 	}
// }

export function createEventActions<EventType extends GenericEventType>({
	redisURL
}: { redisURL: string }) {
	const publisher = new Redis(redisURL)

	return {
		async send<EventInstance extends Exclude<keyof EventType, number | symbol>>(
			channel: EventInstance,
			event: EventType[EventInstance]
		) {
			console.log('Not implemented')
			console.log(channel, event)

			// await fetch('/api/core', {
			// 	method: 'POST',
			// 	body: JSON.stringify({
			// 		message: JSON.stringify(event) // TODO: match event type to target
			// 	})
			// })

			// await eventHandlers[action]?.(data, username)
		},

		async publish<EventInstance extends Exclude<keyof EventType, number | symbol>>(
			channel: string,
			event: EventType[EventInstance]
		) {
			publisher.publish(channel, JSON.stringify(event))
		},

		subscribe<EventInstance extends Exclude<keyof EventType, number | symbol>>(
			channel: EventInstance,
			_callback: (event: EventType[EventInstance]) => void
		) {
			console.log('Not implemented')
			console.log(channel)
		}
	}
}

export function createEventsHandler({ redisURL }: { redisURL: string }) {
	const subscriber = new Redis(redisURL)
	return {
		async eventsHandler(req: Request): Promise<Response> {
			const { searchParams } = new URL(req.url)
			const id = searchParams.get('id')

			if (!id) return new Response('No id provided', { status: 400 })

			const { writable, readable } = new TransformStream()
			const writer = writable.getWriter()

			const encoder = new TextEncoder()

			const listener = async (channel: string, message: string) => {
				if (channel === id) {
					await writer.write(encoder.encode(`data: ${message}\n\n`))
				}
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
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive'
				}
			})
		}
	}
}
