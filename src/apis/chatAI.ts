import { Messages } from '@/components/TalkBoost'

const defaultAPI = 'https://api.openai.com'
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
      model: 'gpt-4.1-mini',
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
