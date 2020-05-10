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

const channelInfos = {
  'UCSJ4gkVC6NrvII8umztf0Ow': {
    name: 'ChilledCow',
    description: 'Multiple live streams always available',
  },
  'UC-hM6YJuNYVAmUWxeIr9FeA': {
    name: 'Miko Ch. さくらみこ',
    description: 'Miko\'s ELITE channel',
  },
  'UCCzUftO8KOVkV4wQG1vkUvg': {
    name: 'Marine Ch. 宝鐘マリン',
    description: 'Test channel 1',
  },
  'UC1opHUrw8rvnsadT-iGp7Cg': {
    name: 'Aqua Ch. 湊あくあ',
    description: 'Test channel 2',
  },
  'UCdn5BQ06XqgXoAxIhbqw5Rg': {
    name: 'フブキCh。白上フブキ',
    description: 'Test channel 3',
  },
}

const regex = /\d watching.*?"videoId":"([^"]+)"/g

const handleRequest = async (event) => {
  try {
    const cache = caches.default
    const cacheUrl = new URL(event.request.url)

    let response = await cache.match(cacheUrl)

    if (!response) {
      const jsonStrings = await Promise.all(
        Object.entries(channelInfos).map(
          async ([channelId]) => ({
            channelId,
            jsonString: await fetch(
              `https://m.youtube.com/channel/${channelId}/videos?view=2&flow=list&pbj=1`,
              init,
            ).then(response => response.text()),
          }),
        ),
      )
      const result = Object.fromEntries(
        jsonStrings.map(({ channelId, jsonString }) => {
          const vids = [...jsonString.matchAll(regex)].map(([, group]) => group)

          return [channelId, { ...channelInfos[channelId], vids }]
        }),
      )

      response = new Response(JSON.stringify(result), {
        headers: {
          'content-type': type,
          'cache-control': 'no-cache',
          'x-cache-time': new Date(),
        }
      })

      event.waitUntil(cache.put(cacheUrl, response.clone()))
    }
    return response
  } catch (err) {
    // Display the error stack.
    return new Response(err.stack || err)
  }
}

addEventListener('fetch', event => event.respondWith(handleRequest(event)))