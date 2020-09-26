import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
}

const defaultChannels = ['123', '13946381', '21584153']

const config = {
  getRequestUrl: channel => `https://api.live.bilibili.com/xlive/web-room/v1/index/getH5InfoByRoom?room_id=${channel}`,
  requestHeaders: headers,
  responseType: 'json',
  defaultChannels,
}

const handleSubResponse = (data = {}) => {
  const { code } = data

  if (code !== 0) {
    return {}
  }

  const {
    data: {
      room_info: {
        live_status: status, cover, title, room_id: roomId,
      },
    },
  } = data

  if (status !== 1) {
    return {}
  }

  return { [roomId]: { title, cover } }
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
