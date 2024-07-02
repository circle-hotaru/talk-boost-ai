const defaultApiUrl = 'https://api.naga.ac'
const proxyApiUrl = process.env.NAGAAI_API_PROXY
const apiUrl = proxyApiUrl ?? defaultApiUrl
const apiKey = process.env.NAGAAI_API_KEY

interface Message {
  role: string
  content: string
}

// NagaAI discord: https://discord.gg/C7aHnWqH
export const requestNagaAI = async (messages: Array<Message>) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: !!apiKey ? `Bearer ${apiKey}` : null,
    },
    body: JSON.stringify({
      model: 'claude-3.5-sonnet-20240620',
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
