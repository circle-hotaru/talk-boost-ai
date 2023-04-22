import type { NextApiRequest, NextApiResponse } from 'next'

const proxyAPI = 'https://elevenlabs-api.incircles.xyz'
const voice_id = '21m00Tcm4TlvDq8ikWAM'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = req.body.message
  const requestOptions = {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
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
      `${proxyAPI}/v1/text-to-speech/${voice_id}`,
      requestOptions
    )
    if (!response.ok) {
      throw new Error('something went wrong')
    }
    const buffer = await response.arrayBuffer()
    const typedArray = new Uint8Array(buffer)
    const nodeBuffer = Buffer.from(typedArray)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.send(nodeBuffer)
  } catch (error) {
    console.error(error)
  }
}
