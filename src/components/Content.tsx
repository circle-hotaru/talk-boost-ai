import { useEffect, useState, KeyboardEvent } from 'react'
import { sendRequest } from '~/apis/openai'

const Content = () => {
  const [sendFlag, setSendFlag] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [response, setResponse] = useState<string>('')

  const handleSend = () => {
    const input_json = { role: 'user', content: input }
    setMessages((prevMessages) => [...prevMessages, input_json])
    setInput('')
    setSendFlag(!sendFlag)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input.length === 0) return
      handleSend()
    } else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      setInput(input + '\n')
    }
  }

  useEffect(() => {
    if (response.length !== 0 && response !== 'undefined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ])
    }
  }, [response])

  useEffect(() => {
    if (messages.length > 0) {
      let messagesToSent = messages
      messagesToSent.unshift({
        role: 'system',
        content:
          'You are an English teacher, please help me practice daily English communication. If I make any mistakes, please point them out and correct them.',
      })
      sendRequest(messagesToSent, (data: any) => {
        if (data) {
          setResponse(data.choices[0].message.content)
          console.log('Response: ' + data.choices[0].message.content)
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [sendFlag])

  return (
    <div>
      <div>
        {messages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }, index) => (
            <p key={index}>{`${role}: ${content}`}</p>
          ))}
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        &nbsp;
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export default Content
