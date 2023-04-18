import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { sendRequest } from '~/apis/openai'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { useSpeechSynthesis } from 'react-speech-kit'
import { isIOS } from '~/utils'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const UserPanel: React.FC<{ content: string }> = ({ content }) => {
  return (
    <span
      className={
        'self-end px-3 py-2 rounded-lg bg-blue-400 text-right font-normal text-slate-50'
      }
    >
      {content}
    </span>
  )
}

const AIPanel: React.FC<{ content: string }> = ({ content }) => {
  return (
    <span
      className={
        'self-start px-3 py-2 rounded-lg bg-slate-50 text-left font-normal text-gray-900'
      }
    >
      {content}
    </span>
  )
}

const Content = () => {
  const [sending, setSending] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition()
  const { speak } = useSpeechSynthesis()
  if (!browserSupportsSpeechRecognition) {
    console.log("Browser doesn't support speech recognition.")
  }

  // auto scroll
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState<boolean>(false)

  const handleSend = () => {
    const input_json = { role: 'user', content: input }
    setMessages((prevMessages) => [...prevMessages, input_json])
    setInput('')
    setSending(true)
  }

  const handleRecord = () => {
    if (!recordFlag) {
      SpeechRecognition.startListening({ continuous: true })
    } else {
      SpeechRecognition.stopListening()
      setInput(transcript)
    }
    setRecordFlag(!recordFlag)
  }

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input.length === 0) return
      handleSend()
    } else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      setInput(input + '\n')
    }
  }
  const handleReturns = () => {
    if (response) {
      speak({ text: response })
    } else {
      speak({ text: 'Please start chatting with me' })
    }
  }
  useEffect(() => {
    if (response.length !== 0 && response !== 'undefined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ])
      setTimeout(() => {
        speak({ text: response })
      }, 1000)
      setSending(false)
    }
  }, [response])

  useEffect(() => {
    if (sending && messages.length > 0) {
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
  }, [sending])

  useLayoutEffect(() => {
    setTimeout(() => {
      const dom = latestMessageRef.current
      if (dom && !isIOS() && autoScroll) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 500)
  })

  return (
    <>
      <div className="w-full max-w-3xl flex-1 flex flex-col gap-2 my-4 border-2 font-bold py-2 px-4 rounded-lg overflow-y-auto">
        {messages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }, index) =>
            role === 'user' ? (
              <UserPanel key={index} content={content} />
            ) : (
              <AIPanel key={index} content={content} />
            )
          )}
        <div ref={latestMessageRef} className="opacity-0 h-0.5">
          -
        </div>
      </div>
      <div className="w-full max-w-3xl flex flex-wrap justify-end items-center gap-2 mx-auto">
        <TextareaAutosize
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={10}
          placeholder="Type your message here"
          className="w-full flex-none md:flex-1 px-4 py-2 rounded-lg resize-none bg-gray-200 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onFocus={() => setAutoScroll(true)}
          onBlur={() => setAutoScroll(false)}
          autoFocus
        />
        <button
          onClick={handleRecord}
          className="px-4 py-2 border border-blue-600 rounded-lg bg-white font-bold text-blue-600"
        >
          {listening ? <span>Speaking</span> : <span>Record</span>}
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-2 rounded-lg bg-blue-600 font-bold text-white"
        >
          {sending ? (
            <AiOutlineLoading3Quarters className="animate-spin w-6 h-6" />
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>
    </>
  )
}

export default Content
