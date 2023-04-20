const ttsBaseUrl = 'https://api.elevenlabs.io';

const getTTSApi = '/v1/voices';
const apiKey = '7c17fca867933ce98487ecd02adba18b';
export const requestGetVoiceApi = (callback) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'xi-api-key': apiKey,
    },
  };
  fetch(`${ttsBaseUrl}/v1/voices`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      callback(data);
    })
    .catch((err) => {
      return err;
    });
};

export const requestGetTTSApi = (message, callback) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: message,
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
      },
    }),
  };
  const voice_id = '21m00Tcm4TlvDq8ikWAM';
  fetch(`${ttsBaseUrl}/v1/text-to-speech/${voice_id}`, requestOptions)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      callback(data);
    })
    .catch((err) => {
      return err;
    });
};
