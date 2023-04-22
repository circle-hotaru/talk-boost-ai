import type { NextApiRequest, NextApiResponse } from 'next'

const officalAPI = 'https://api.openai.com'
const proxyAPI = 'https://chat-api.incircles.xyz'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const messages = req.body.messages
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
    }),
  }

  try {
    const response = await fetch(
      `${proxyAPI}/v1/chat/completions`,
      requestOptions
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error(error)
  }
}
