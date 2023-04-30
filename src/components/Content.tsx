import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { requestOpenAI } from '~/apis/openai'
import { requestGetVoiceApi, requestGetTTSApi } from '~/apis/tts'
import { isIOS } from '~/utils'
import { SettingOutlined } from '@ant-design/icons'
import { Input, Button } from 'antd'
import SettingsModal from './SettingsModal'

interface ContentProps {}

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

const AIPanel: React.FC<{
  content: string
  enabled: boolean
  sending: boolean
}> = ({ content, enabled, sending }) => {
  return (
    <div className="flex flex-nowrap gap-1 items-center">
      <span
        className={
          'self-start mr-1 px-4 py-2 rounded-lg bg-slate-50 text-left font-normal text-gray-900'
        }
      >
        {content}
      </span>
      {enabled && <TTSPanel content={content} sending={sending} />}
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

  const handleSpeak = () => {
    audioRef.current.play()
    // setSpeak(true)
    // if (!speak) {
    //   audioRef.current.pause();
    //   audioRef.current.currentTime = 0;
    // }
  }

  useEffect(() => {
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
          <Button type="text" size="small" onClick={handleSpeak}>
            🎧
          </Button>
        </>
      )}
    </span>
  )
}

const { TextArea } = Input

const Content: React.FC<ContentProps> = () => {
  const [sending, setSending] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const [enabled, setEnabled] = useState<boolean>(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

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
      const data = await requestOpenAI(messages)
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
      <div className="w-full max-w-3xl flex-1 flex flex-col gap-2 mt-4 border-solid border-2 border-gray-200 font-bold py-2 px-4 rounded-lg overflow-y-auto">
        {messages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }, index) =>
            role === 'user' ? (
              <UserPanel key={index} content={content} />
            ) : (
              <AIPanel
                key={index}
                content={content}
                sending={sending}
                enabled={enabled}
              />
            )
          )}
        <div ref={latestMessageRef} className="opacity-0 h-0.5">
          -
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <SettingOutlined
          onClick={() => setIsSettingsOpen(true)}
          className="self-start mt-4 mb-2 pl-2 text-gray-500 cursor-pointer"
        />
      </div>

      <div className="w-full max-w-3xl flex flex-wrap justify-end items-center gap-2 mx-auto">
        <TextArea
          placeholder="Type your message here"
          autoSize={{ minRows: 1, maxRows: 6 }}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onFocus={() => setAutoScroll(true)}
          onBlur={() => setAutoScroll(false)}
          autoFocus
          allowClear
          onPressEnter={handleKeyDown}
          className="w-full flex-none md:flex-1 "
        />
        <Button type="primary" onClick={handleRecord}>
          {listening ? <span>Speaking</span> : <span>Record</span>}
        </Button>
        <Button onClick={handleSend} disabled={sending} loading={sending}>
          Send
        </Button>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}

export default Content
