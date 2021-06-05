import { generate } from '@holo-schedule-workers/shared'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) '
    + 'AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/83.0.4103.61 Mobile '
    + 'Safari/537.36',
  'x-youTube-client-Name': '2',
  'x-youTube-client-version': '2.20210511.03.00',
}

const regexLikes = /([\d,]+) likes/

const defaultChannels = [
  'ulhc-rUlJ94',
]

const config = {
  getRequestUrl: channel => `https://m.youtube.com/watch?v=${channel}?&pbj=1`,
  requestHeaders: headers,
  responseType: 'text',
  defaultChannels,
}

const handleSubResponse = (data = '') => {
  const liveInfo = {}
  try {
    const $ = JSON.parse(data)

    liveInfo.title = $[2].playerResponse.videoDetails.title
    liveInfo.cover = `https://img.youtube.com/vi/${$[2].playerResponse.videoDetails.videoId}/mqdefault.jpg`

    const duration = $[2].playerResponse.videoDetails.lengthSeconds
    const isEnded = duration !== '0'

    if (isEnded) {
      liveInfo.duration = Number(duration)
    }

    const isScheduled = $[2].playerResponse.videoDetails.isUpcoming

    if (isScheduled) {
      liveInfo.startAt = Number($[2].playerResponse.playabilityStatus.liveStreamability.liveStreamabilityRenderer.offlineSlate.liveStreamOfflineSlateRenderer.scheduledStartTime)
    }

    const isLiving = $[2].playerResponse.microformat.playerMicroformatRenderer.liveBroadcastDetails.isLiveNow

    if (isLiving) {
      const likes = regexLikes.exec($[3].response.contents.singleColumnWatchNextResults.results.results.contents[1].itemSectionRenderer.contents[0].slimVideoMetadataRenderer.buttons[0].slimMetadataToggleButtonRenderer.button.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label)
      liveInfo.watching = Number($[3].response.contents.singleColumnWatchNextResults.results.results.contents[1].itemSectionRenderer.contents[0].slimVideoMetadataRenderer.collapsedSubtitle.runs[0].text.replace(',', ''))
      liveInfo.like = Number(likes[1].replace(',', ''))
    }
  } catch (err) {
    liveInfo.err = err.message
  }
  return liveInfo
}

const handleRequest = generate(config, handleSubResponse)

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
