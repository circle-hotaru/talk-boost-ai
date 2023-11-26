const defaultApiUrl = 'https://api.openai.com'
const proxyApiUrl = process.env.OPENAI_API_PROXY
const apiUrl = proxyApiUrl ?? defaultApiUrl
const apiKey = process.env.OPENAI_API_KEY

interface Message {
  role: string
  content: string
}

export const requestOpenAI = async (messages: Array<Message>) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: !!apiKey ? `Bearer ${process.env.OPENAI_API_KEY}` : null,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
    }),
  }

  try {
    const response = await fetch(
      `${apiUrl}/v1/chat/completions`,
      requestOptions
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
