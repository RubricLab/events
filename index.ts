import Redis from 'ioredis'
import type { z } from 'zod'

type GenericEventType = Record<string, z.infer<z.ZodTypeAny>>
export class EventDispatcher<EventType extends GenericEventType> {
	subscriber: Redis
	publisher: Redis

	constructor({ redisURL }: { redisURL: string }) {
		this.subscriber = new Redis(redisURL)
		this.publisher = new Redis(redisURL)
	}

	async send<EventInstance extends Exclude<keyof EventType, number | symbol>>(
		channel: EventInstance,
		event: EventType[EventInstance]
	) {
		console.log('Not implemented')
		console.log(channel, event)

		// await eventHandlers[action]?.(data, username)
	}

	subscribe<EventInstance extends Exclude<keyof EventType, number | symbol>>(
		channel: EventInstance,
		_callback: (event: EventType[EventInstance]) => void
	) {
		console.log('Not implemented')
		console.log(channel)
	}

	async handler(_req: Request): Promise<Response> {
		return new Response('Hello world!')
	}
}
