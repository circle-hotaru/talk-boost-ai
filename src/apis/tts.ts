import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const { TSS_API_KEY } = publicRuntimeConfig

const ttsBaseUrl = 'https://elevenlabs-api.incircles.xyz'

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

export const requestGetTTSApi = async (message) => {
  const voice_id = '21m00Tcm4TlvDq8ikWAM'
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
  try {
    const response = await fetch(
      `${ttsBaseUrl}/v1/text-to-speech/${voice_id}`,
      requestOptions
    )
    if (!response.ok) {
      throw new Error('something went wrong')
    }
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error(error)
    throw error
  }
}
