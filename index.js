addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

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
      const liveInfos = await fetch(
        `https://m.youtube.com/channel/${channel}/videos?view=2&flow=list&pbj=1`,
        init,
      ).then(
        response => response.text(),
      ).then(
        data => data.split('compactVideoRenderer'),
      ).then(
        fragments => fragments.map(fragment => {
          const isLiving = regex_living.exec(fragment)
          const isScheduled = regex_scheduled.exec(fragment)

          if (!(isLiving || isScheduled)) return

          const title = regex_title.exec(fragment)
          const room = regex_room.exec(fragment)

          return [room[1], {
            title: title[1],
            ...(isScheduled ? { startAt: Number(isScheduled[1]) } : {})
          }]
        }),
      ).then(entries => entries.filter(entry => entry))

      return [channel, Object.fromEntries(liveInfos)]
    })).then(
      Object.fromEntries
    ).then(
      JSON.stringify
    ).then(
      body => new Response(body, {
        headers: {
          'content-type': type,
          'cache-control': 'no-cache',
          'x-cache-time': String(new Date()),
        },
      })
    )
  } catch (err) {
    // Display the error stack.
    return new Response(err.stack || err)
  }
}

const type = 'application/json;charset=UTF-8'

const init = {
  headers: {
    'content-type': type,
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) '
      + 'AppleWebKit/605.1.15 (KHTML, like Gecko) '
      + 'CriOS/69.0.3497.91 Mobile/15E148 Safari/605.1',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.5',
    // TODO: The Prod worker seems to fail to parse the 'br' encoded content
    // 'accept-encoding' : 'gzip, br',
    'accept-encoding': 'gzip',
    'x-youTube-client-Name': '2',
    'x-youTube-client-version': '2.20200410',
  },
}

const defaultChannels = ['UC-1A', 'UC1opHUrw8rvnsadT-iGp7Cg', 'UC1DCedRgGHBdm81E1llLhOQ', 'UCdn5BQ06XqgXoAxIhbqw5Rg', 'UCSJ4gkVC6NrvII8umztf0Ow']

const regex_title = /"title":{"runs":\[{"text":"([^"]+)/
const regex_room = /"videoId":"([^"]+)/
const regex_scheduled = /"startTime":"(\d+)/
const regex_living = /watching/
