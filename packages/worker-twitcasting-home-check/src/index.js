import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
}

const defaultChannels = [
  // ended
  'natsuiromatsuri',
  // 'dYvQcVG_dVg',
  // living
  '8icoeithgybnh5v',
  // scheduled
  // 'Fs21f04tFUo',
  // bad
  // 'bXKMnry8RFI',
]

const config = {
  getRequestUrl: channel => `https://m.twitcasting.tv/${channel}`,
  requestHeaders: headers,
  responseType: 'text',
  defaultChannels,
}

const regexTitle = /property="og:title" content="(.*?)"/
const regexCover = /property="og:image" content="(.*?)"/

const handleSubResponse = (data = '') => {
  const liveInfo = {}
  try {
    // eslint-disable-next-line prefer-destructuring
    liveInfo.title = regexTitle.exec(data)[1]
    // eslint-disable-next-line prefer-destructuring
    liveInfo.cover = regexCover.exec(data)[1]

    liveInfo.status = data.includes('data-is-onlive="true"') ? 'living' : 'ended'
  } catch (err) {
    liveInfo.status = 'error'
    liveInfo.err = err.message
  }
  return liveInfo
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
