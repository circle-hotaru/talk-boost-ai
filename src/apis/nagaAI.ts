import { Messages } from '~/components/TalkBoost'

const defaultApiUrl = 'https://api.naga.ac'
const proxyApiUrl = process.env.NEXT_PUBLIC_NAGA_API_PROXY
const apiUrl = proxyApiUrl ?? defaultApiUrl
const apiKey = process.env.NEXT_PUBLIC_NAGA_API_KEY

// NagaAI discord: https://discord.gg/C7aHnWqH
export const requestNagaAI = async (messages: Messages): Promise<string> => {
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

  const response = await fetch(`${apiUrl}/v1/chat/completions`, requestOptions)
  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }
  const data = await response.json()
  return data.choices[0].message.content
}
