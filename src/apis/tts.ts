import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const { TSS_API_KEY } = publicRuntimeConfig

const ttsBaseUrl = 'https://api.elevenlabs.io'

export const requestGetVoiceApi = (callback) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'xi-api-key': TSS_API_KEY,
    },
  }
  fetch(`${ttsBaseUrl}/v1/voices`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      callback(data)
    })
    .catch((err) => {
      return err
    })
}

export const requestGetTTSApi = (message, callback) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': TSS_API_KEY,
    },
    body: JSON.stringify({
      text: message,
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
      },
    }),
  }
  const voice_id = '21m00Tcm4TlvDq8ikWAM'
  fetch(`${ttsBaseUrl}/v1/text-to-speech/${voice_id}`, requestOptions)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      callback(data)
    })
    .catch((err) => {
      return err
    })
}
