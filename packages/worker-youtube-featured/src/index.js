import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 '
    + 'Safari/537.36',
  'x-youTube-client-Name': '1',
  'x-youTube-client-version': '2.20200605.00.00',
}

const regexTitle = /"simpleText":"([^"]+)/
const regexRoom = /"videoId":"([^"]+)/
const regexScheduled = /"startTime":"(\d+)/
const regexLiving = /" watching"/

const defaultChannels = [
  'UC1opHUrw8rvnsadT-iGp7Cg',
  'UC1DCedRgGHBdm81E1llLhOQ',
  'UCp-5t9SrOQwXMU7iIjQfARg',
  'UC1uv2Oq6kNxgATlCiez59hw',
  'UCSJ4gkVC6NrvII8umztf0Ow',
]

const config = {
  getRequestUrl: channel => `https://www.youtube.com/channel/${channel}/featured?pbj=1`,
  requestHeaders: headers,
  responseType: 'text',
  defaultChannels,
}

const handleSubResponse = (data = '') => {
  const liveInfos = []

  data.split('ideoRenderer').forEach(fragment => {
    const isLiving = regexLiving.exec(fragment)
    const isScheduled = regexScheduled.exec(fragment)

    if (!(isLiving || isScheduled)) return

    const title = regexTitle.exec(fragment)
    const room = regexRoom.exec(fragment)

    // eslint-disable-next-line consistent-return
    liveInfos.push([room[1], {
      title: title[1],
      cover: `https://img.youtube.com/vi/${room[1]}/mqdefault.jpg`,
      ...(isScheduled ? { startAt: Number(isScheduled[1]) } : {}),
    }])
  })

  return Object.fromEntries(liveInfos)
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
