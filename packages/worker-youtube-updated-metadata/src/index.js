import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'content-type': 'application/json',
}

const defaultChannels = [
  // ended
  'BYIbgX66_h0',
  'dYvQcVG_dVg',
  // living
  'LTWU4bb5gRw',
  // scheduled
  'FwBuNWQfKcg',
  // bad
  'bXKMnry8RFI',
]

const config = {
  getRequestUrl: () => 'https://www.youtube.com/youtubei/v1/updated_metadata?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
  getPostBody: videoId => `
{
  "context": {
    "client": {
      "hl": "de-DE",
      "clientName": "WEB",
      "clientVersion": "2.20210531.07.00"
    }
  },
  "videoId": "${videoId}"
}`,
  method: 'POST',
  requestHeaders: headers,
  responseType: 'text',
  defaultChannels,
}

const convert = actions => {
  const result = {}
  actions.forEach(action => {
    const key = Object.keys(action)[0]
    result[key] = result[key] ? [result[key], action[key]].flat() : action[key]
  })
  return result
}

const handleSubResponse = (data = '', videoId) => {
  const liveInfo = {}
  try {
    const { actions } = JSON.parse(data)

    if (!actions) {
      throw new Error('Private video.')
    }

    const {
      updateViewershipAction,
      updateToggleButtonTextAction,
      updateTitleAction,
    } = convert(actions)

    const titleRuns = updateTitleAction?.title?.runs || []

    liveInfo.title = titleRuns.map(({ text }) => text).join('')
    liveInfo.cover = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

    if (updateViewershipAction) {
      const viewCountText = updateViewershipAction?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || ''

      if (/Aktuell/.test(viewCountText)) {
        const likeCountText = updateToggleButtonTextAction?.defaultText?.simpleText || ''

        liveInfo.status = 'living'
        liveInfo.watching = Number(viewCountText.replace(/\D/g, ''))
        liveInfo.like = Number(likeCountText.replace(/\D/g, ''))
      } else {
        liveInfo.status = 'scheduled'
      }
    } else {
      liveInfo.status = 'ended'
    }
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
