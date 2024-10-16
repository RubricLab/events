// /api/events/route.ts
// import { dispatcher } from '~/events'
// export default dispatcher.handle(['slack.message'], {
// 	callback: ({ channelId, body }) => {}
// })

// c2s
// website posts to /api/events
// GET 200 OK HEARD

// what does it do at /api/events?
// if busy, offload to DB with timestamp + unread
// if free, await call Agent route

// s2s
// slack posts to /api/events
// does the same as above
// (some "ai.core" key points to "/api/core")

// s2c
// ai posts to /api/events
// GET 200 OK HEARD , { jobId }

// what does it do at /api/events?
// redis.publish
