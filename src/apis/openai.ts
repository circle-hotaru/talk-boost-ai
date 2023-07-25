const proxyAPI = 'https://chimeragpt.adventblocks.cc'

export const requestOpenAI = async (messages: any[]) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CHIMERA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
    }),
  }

  try {
    const response = await fetch(
      `${proxyAPI}/api/v1/chat/completions`,
      requestOptions
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
