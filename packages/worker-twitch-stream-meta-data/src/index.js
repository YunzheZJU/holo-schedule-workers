import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
  'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
}

const defaultChannels = ['sakuramiko_hololive', 'faker', 'tastybeardtv', '123456']

const config = {
  getRequestUrl: () => 'https://gql.twitch.tv/gql',
  getPostBody: channel => `[
  {
    "operationName": "StreamMetadata",
    "variables": {
      "channelLogin": "${channel}"
    },
    "extensions": {
      "persistedQuery": {
        "version": 1,
        "sha256Hash": "1c719a40e481453e5c48d9bb585d971b8b372f8ebb105b17076722264dfa5b3e"
      }
    }
  }
]`,
  method: 'POST',
  requestHeaders: headers,
  responseType: 'json',
  defaultChannels,
}

const handleSubResponse = (data = [], channel) => {
  try {
    const {
      lastBroadcast: { id: lastBroadcastId, title }, stream: { id: streamId },
    } = data[0].data.user

    if (streamId !== lastBroadcastId) {
      return {}
    }

    return { [channel]: { title, cover: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-160x90.jpg` } }
  } catch {
    return {}
  }
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
