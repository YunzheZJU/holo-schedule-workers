const defaultHeaders = {
  accept: '*/*',
  'accept-language': 'en-US,en;q=0.5',
  // TODO: The Prod worker seems to fail to parse the 'br' encoded content
  // 'accept-encoding' : 'gzip, br',
  'accept-encoding': 'gzip',
}

const generate = (config = {
  getRequestUrl: () => {
    throw new Error('No url is specified.')
  },
  getPostBody: () => undefined,
  method: 'GET',
  requestHeaders: {},
  responseType: 'text',
  defaultChannels: [],
}, onSubResponse) => async request => {
  try {
    const {
      getRequestUrl, getPostBody, method, requestHeaders: headers, responseType, defaultChannels,
    } = config
    // ['UC-1A', 'UC-2B']
    let channels = (new URL(request.url)).searchParams.getAll('channels')

    channels = channels.length ? channels : defaultChannels

    return await Promise.all(channels.map(async channel => {
      const response = await fetch(
        getRequestUrl(channel),
        {
          headers: { ...defaultHeaders, ...headers },
          method,
          body: method === 'POST' ? getPostBody(channel) : undefined,
        },
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      return [channel, onSubResponse(await response[responseType](), channel)]
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
            'content-type': 'application/json;charset=UTF-8',
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

module.exports = {
  generate,
}
