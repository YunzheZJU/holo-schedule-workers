const type = 'application/json;charset=UTF-8'

const init = {
  headers: {
    'content-type': type,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
      + 'AppleWebKit/537.36 (KHTML, like Gecko) '
      + 'Chrome/83.0.4103.61 '
      + 'Safari/537.36',
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.5',
    // TODO: The Prod worker seems to fail to parse the 'br' encoded content
    // 'accept-encoding' : 'gzip, br',
    'accept-encoding': 'gzip',
    'x-youTube-client-Name': '1',
    'x-youTube-client-version': '2.20200605.00.00',
  },
}

const defaultChannels = [
  'UC1opHUrw8rvnsadT-iGp7Cg',
  'UC1DCedRgGHBdm81E1llLhOQ',
  'UCa9Y57gfeY0Zro_noHRVrnw',
  'UC1uv2Oq6kNxgATlCiez59hw',
  'UCSJ4gkVC6NrvII8umztf0Ow',
]

const regexTitle = /"simpleText":"([^"]+)/
const regexRoom = /"videoId":"([^"]+)/
const regexScheduled = /"startTime":"(\d+)/
const regexLiving = /" watching"/

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    // ['UC-1A', 'UC-2B']
    let channels = (new URL(request.url)).searchParams.getAll('channels')

    channels = channels.length ? channels : defaultChannels

    return await Promise.all(channels.map(async channel => {
      const liveInfos = []

      await fetch(
        `https://www.youtube.com/channel/${channel}/featured?pbj=1`,
        init,
      )
        .then(
          response => {
            if (response.ok) return response.text()
            throw new Error('Network response was not ok')
          },
        )
        .then(
          data => data.split('ideoRenderer'),
        )
        .then(
          fragments => fragments.forEach(fragment => {
            const isLiving = regexLiving.exec(fragment)
            const isScheduled = regexScheduled.exec(fragment)

            if (!(isLiving || isScheduled)) return

            const title = regexTitle.exec(fragment)
            const room = regexRoom.exec(fragment)

            // eslint-disable-next-line consistent-return
            liveInfos.push([room[1], {
              title: title[1],
              ...(isScheduled ? { startAt: Number(isScheduled[1]) } : {}),
            }])
          }),
        )

      return [channel, Object.fromEntries(liveInfos)]
    }))
      .then(
        Object.fromEntries,
      )
      .then(
        JSON.stringify,
      )
      .then(
        body => new Response(body, {
          headers: {
            'content-type': type,
            'cache-control': 'no-cache',
            'x-cache-time': String(new Date()),
          },
        }),
      )
  } catch (err) {
    // Display the error stack.
    return new Response(err.stack || err)
  }
}

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
