import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { useSpeechSynthesis } from 'react-speech-kit'
import { requestGetVoiceApi, requestGetTTSApi } from '~/apis/tts'
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

const AIPanel: React.FC<{ content: string; sending: boolean }> = ({
  content,
  sending,
}) => {
  return (
    <div className="flex flex-nowrap gap-1 items-center">
      <span
        className={
          'self-start mr-1 px-4 py-2 rounded-lg bg-slate-50 text-left font-normal text-gray-900'
        }
      >
        {content}
      </span>
      <TTSPanel content={content} sending={sending} />
    </div>
  )
}

const TTSPanel: React.FC<{ content: string; sending: boolean }> = ({
  content,
  sending,
}) => {
  const [audioSource, setAudioSource] = useState(null)
  const [voice, setVoiceList] = useState<any[]>([])
  const audioRef = useRef(null)

  // const handleGenAudio = async (message) => {
  //   if (!content) return
  //   try {
  //     const response = await fetch('/api/elevenlabsai', {
  //       method: 'POST',
  //       headers: {
  //         accept: 'audio/mpeg',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         message,
  //       }),
  //     })
  //     const blob = await response.blob()
  //     const audioURL = URL.createObjectURL(blob)

  //     if (audioURL) {
  //       setAudioSource(audioURL)
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  const handleSpeak = () => {
    audioRef.current.play()
    // setSpeak(true)
    // if (!speak) {
    //   audioRef.current.pause();
    //   audioRef.current.currentTime = 0;
    // }
  }

  useEffect(() => {
    // handleGenAudio(content)
    const genAudio = async () => {
      if (!!content) {
        try {
          const audioURL = await requestGetTTSApi(content)
          setAudioSource(audioURL)
        } catch (error) {
          console.error('error', error)
        }
      }
    }
    genAudio()
  }, [])

  useEffect(() => {
    if (!!audioSource) {
      audioRef.current.play()
    }
  }, [audioSource])

  // 这个是语音样本
  // useEffect(() => {
  //   if (voice.length === 0) {
  //     requestGetVoiceApi((data) => {
  //       setVoiceList([...data.voices]);
  //     });
  //   }
  // }, [voice]);

  useEffect(() => {
    if (!!audioSource && sending) {
      audioRef.current.pause()
    }
  }, [sending])

  return (
    <span>
      {audioSource && (
        <>
          <audio ref={audioRef} src={audioSource} />
          <button onClick={handleSpeak}>🎧</button>
        </>
      )}
    </span>
  )
}

const Content: React.FC = () => {
  const [sending, setSending] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()
  // const { speak } = useSpeechSynthesis()

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
      resetTranscript()
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

  const handleGenAIResponse = async (messages) => {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      })
      const data = await response.json()
      if (data) {
        setResponse(data.choices[0].message.content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (response.length !== 0 && response !== 'undefined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ])
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
      handleGenAIResponse(messagesToSent)
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
              <AIPanel key={index} content={content} sending={sending} />
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
