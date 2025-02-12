# @rubriclab/events

To use:

```ts
import { createEvents } from '@rubriclab/events'

const { publish, useEvents } = createEvents({
  eventTypes: {
    message: z.object({
      message: z.string()
    })
  }
})
```

To install dependencies:

```bash
bun i
```

Commits to main will automatically publish a new version to npm.
