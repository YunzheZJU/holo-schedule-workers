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

    const result = Object.fromEntries(await Promise.all(
      channels.map(
        async (channel) => ([
          channel, {
            living: Object.fromEntries(await fetch(
              `https://m.youtube.com/channel/${channel}/videos?view=2&flow=list&pbj=1`,
              init,
            ).then(response => response.text()).then(
              data => [...data.matchAll(regex)].map(
                ([, title, room]) => [room, {title, start_at: 'Time'}],
              ),
            )),
          },
        ]),
      ),
    ))

    return new Response(JSON.stringify(result), {
      headers: {
        'content-type': type,
        'cache-control': 'no-cache',
        'x-cache-time': new Date(),
      },
    })
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

const regex = /"title":{"runs":\[{"text":"([^"]+).*?\d watching.*?"videoId":"([^"]+)"/g