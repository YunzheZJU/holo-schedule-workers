import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
}

const defaultChannels = ['123', '13946381', '21584153']

const config = {
  getRequestUrl: channel => `https://api.live.bilibili.com/room/v1/RoomStatic/get_room_static_info?room_id=${channel}`,
  requestHeaders: headers,
  responseType: 'json',
  defaultChannels,
}

const handleSubResponse = (data = {}) => {
  const {
    code, data: {
      live_status: status, user_cover: cover, title, roomid,
    },
  } = data

  if (code === 0 && status === 1) {
    return { [roomid]: { title, cover } }
  }

  return {}
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
