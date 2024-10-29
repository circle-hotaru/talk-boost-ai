import { Messages } from '@/components/TalkBoost'

const defaultAPI = 'https://api.anthropic.com/v1/messages'
const proxyAPI = process.env.NEXT_PUBLIC_CHAT_API_PROXY
const apiUrl = proxyAPI ?? defaultAPI
const apiKey = process.env.NEXT_PUBLIC_CHAT_API_KEY

export const requestChatAI = async (messages: Messages): Promise<string> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: !!apiKey ? `Bearer ${apiKey}` : null,
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: messages,
    }),
  }

  const response = await fetch(`${apiUrl}`, requestOptions)
  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }
  const data = await response.json()
  return data.choices[0].message.content
}
