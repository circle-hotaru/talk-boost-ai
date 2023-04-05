import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const { OPENAI_API_KEY } = publicRuntimeConfig

export const sendRequest = async (
  messages: string[],
  callback: (data: any) => void
) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
    }),
  }

  fetch('https://api.openai.com/v1/chat/completions', requestOptions)
    .then((response) => response.json())
    .then((data) => {
      callback(data)
    })
    .catch((err) => {
      return err
    })
}
