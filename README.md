# @rubriclab/events

This Events package gives you a type-safe, Redis-backed pub/sub layer that streams events from your server to the browser over Server-Sent Events (SSE).

It is part of Rubric's architecture for Generative UI when used with:
- [@rubriclab/actions](https://github.com/rubriclab/actions)
- [@rubriclab/blocks](https://github.com/rubriclab/blocks)
- [@rubriclab/chains](https://github.com/rubriclab/chains)
- [@rubriclab/agents](https://github.com/rubriclab/agents)

[Demo](https://chat.rubric.sh)

## Get Started
### Installation
`bun add @rubriclab/events`

> @rubriclab scope packages are not built, they are all raw typescript. If using in a next.js app, make sure to transpile.

```ts
// next.config.ts
import type { NextConfig } from  'next' 
export default {
	transpilePackages: ['@rubriclab/events'],
	reactStrictMode: true
} satisfies  NextConfig
```

> If using inside the monorepo (@rubric), simply add `{"@rubriclab/events": "*"}` to dependencies and then run `bun i`


### Define Event types

```ts
export const eventTypes = createEventTypes({
  ping: z.literal('ping'),
})
```

### Create the events server and a route
```ts
import { createEventsServer } from '@rubriclab/events/server'
import env from '~/env'
import { eventTypes } from './types'

export const { publish, GET, maxDuration } = createEventsServer({
	eventTypes,
	redisURL: env.UPSTASH_REDIS_URL
})
```

```ts
// app/api/events/route.ts
export { GET, maxDuration } from './server'
```

### Create the events client

```ts
import { createEventsClient } from '@rubriclab/events/client'
import { eventTypes } from './types'

export const { useEvents } = createEventsClient({
	url: '/api/events', // The url of the server
	eventTypes
})
```

### Publish an event from the server
```ts
await publish({
  channel: '123',
  eventType: 'ping',
  payload: 'ping'
})
```


### Consume it on the client!
```ts
useEvents({
		id: '123',
		on: {
			ping: (payload) => {
				console.log('ping', payload)
			}
		}
	})
```

Commits to main will automatically publish a new version to npm.
