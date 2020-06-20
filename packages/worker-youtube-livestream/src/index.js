import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
  'x-youTube-client-Name': '2',
  'x-youTube-client-version': '2.20200410',
}

const regexTitle = /"title":{"runs":\[{"text":"([^"]+)/
const regexRoom = /"videoId":"([^"]+)/
const regexScheduled = /"startTime":"(\d+)/
const regexLiving = /" watching"/

const defaultChannels = [
  'UC-1A',
  'UC1opHUrw8rvnsadT-iGp7Cg',
  'UC1DCedRgGHBdm81E1llLhOQ',
  'UCdn5BQ06XqgXoAxIhbqw5Rg',
  'UCSJ4gkVC6NrvII8umztf0Ow',
]

const config = {
  getRequestUrl: channel => `https://m.youtube.com/channel/${channel}/videos?view=2&flow=list&pbj=1`,
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
