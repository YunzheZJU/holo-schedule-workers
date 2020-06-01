const type = 'application/json;charset=UTF-8'

const init = {
  headers: {
    'content-type': type,
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) '
      + 'AppleWebKit/605.1.15 (KHTML, like Gecko) '
      + 'CriOS/69.0.3497.91 Mobile/15E148 Safari/605.1',
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.5',
    // TODO: The Prod worker seems to fail to parse the 'br' encoded content
    // 'accept-encoding' : 'gzip, br',
    'accept-encoding': 'gzip',
  },
}

const defaultChannels = ['123', '13946381', '21584153']

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    // ['12345', '67890']
    let channels = (new URL(request.url)).searchParams.getAll('channels')

    channels = channels.length ? channels : defaultChannels

    return await Promise.all(channels.map(async channel => {
      const { code, data: { live_status: status, title } } = await fetch(
        `https://api.live.bilibili.com/room/v1/RoomStatic/get_room_static_info?room_id=${channel}`,
        init,
      )
        .then(
          response => response.json(),
        )

      if (code === 0 && status === 1) {
        return [channel, { [channel]: { title } }]
      }

      return [channel, {}]
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
