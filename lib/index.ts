import type { GenericEvents } from './types'

export function createEventTypes<EventTypes extends GenericEvents>(eventTypes: EventTypes) {
	return eventTypes
}
