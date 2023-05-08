import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import { requestOpenAI } from '~/apis/openai'
import { requestGetVoiceApi, requestGetTTSApi } from '~/apis/tts'
import { getSpeakToTextApi, getTextToSpeakApi } from '~/apis/newTTS'
import { isIOS } from '~/utils'
import { SettingOutlined } from '@ant-design/icons'
import { Input, Button } from 'antd'
import SettingsModal from './SettingsModal'
import { useAtom } from 'jotai'
import { openVoiceAtom, openAiCount } from '~/state/settings'
import { ENGLISH_TEACHER } from '~/constants'

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
  index: number
  content: string
  sending: boolean
}> = ({ content, sending, index }) => {
  const [openVoice] = useAtom(openVoiceAtom)

  return (
    <div className="flex flex-nowrap gap-1 items-center">
      <span
        className={
          'self-start mr-1 px-4 py-2 rounded-lg bg-slate-50 text-left font-normal text-gray-900'
        }
      >
        {content}
      </span>
      <TTSPanel
        enabled={openVoice}
        index={index}
        content={content}
        sending={sending}
      />
    </div>
  )
}

const TTSPanel: React.FC<{
  content: string
  sending: boolean
  enabled: boolean
  index: number
}> = ({ content, sending, enabled, index }) => {
  const [audioSource, setAudioSource] = useState(null)
  const [voice, setVoiceList] = useState<any[]>([])
  const [speak, setSpeak] = useState<boolean>(false)
  const [openSounds, setOpenSounds] = useState<boolean>(false)
  const [speechSynthesizer, setSpeechSynthesizer] = useState<any>({})
  const [aiCount] = useAtom(openAiCount)
  const audioRef = useRef(null)
  const handleSpeak = () => {
    if (!speak) {
      audioSource ? audioRef.current.play() : setOpenSounds(true)
      setSpeak(true)
    } else {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setSpeak(false)
    }
  }
  useEffect(() => {
    if (Object.keys(speechSynthesizer).length === 0) {
      let res = getTextToSpeakApi()
      setSpeechSynthesizer(res)
    }
  }, [speechSynthesizer])
  useEffect(() => {
    if (enabled && aiCount === index) {
      setOpenSounds(true)
    }
  }, [enabled])

  useEffect(() => {
    if (!!content && Object.keys(speechSynthesizer).length > 0 && openSounds) {
      genAudio()
    }
  }, [content, openSounds, speechSynthesizer])

  const genAudio = async () => {
    try {
      speechSynthesizer.speakTextAsync(
        content,
        (result) => {
          const { audioData } = result
          speechSynthesizer.close()
          let blob = new Blob([audioData])
          let urlBlob = URL.createObjectURL(blob)
          setAudioSource(urlBlob)
        },
        (error) => {
          console.log(error)
          speechSynthesizer.close()
        }
      )
    } catch (error) {
      console.error('error', error)
    }
  }

  useEffect(() => {
    if (!!audioSource && sending && enabled) {
      audioRef.current.pause()
    }
  }, [sending])

  return (
    <span className={enabled ? '' : 'w-1'}>
      {enabled && (
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

const Content: React.FC = () => {
  const [sending, setSending] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'system',
      content: ENGLISH_TEACHER,
    },
  ])
  const displayMessages = messages.slice(1)

  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [enabled, setEnabled] = useState<boolean>(true)
  const [listening, setListening] = useState<boolean>(false)
  const [recognizer, setRecognizer] = useState<any>({})

  // auto scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState<boolean>(false)
  const [waiting, setWaiting] = useState<boolean>(false)
  const [, setAiCount] = useAtom(openAiCount)
  const handleSend = () => {
    const input_json = { role: 'user', content: input }
    setMessages((prevMessages) => [...prevMessages, input_json])
    setInput('')
    setSending(true)
  }

  useEffect(() => {
    if (Object.keys(recognizer).length === 0) {
      let res = getSpeakToTextApi()
      setRecognizer(res)
    }
  }, [recognizer])

  const handleRecord = () => {
    if (!recordFlag) {
      setWaiting(true)
      recognizer.startContinuousRecognitionAsync(
        () => {
          setWaiting(false)
        },
        (err) => {
          recognizer.stopContinuousRecognitionAsync()
        }
      )
      recognizer.recognized = function (s, e) {
        if (e.result.text !== undefined) {
          let result = e.result.text
          setInput((pre) => pre + result)
        }
      }
      recognizer.sessionStopped = (s, e) => {
        setWaiting(false)
        recognizer.stopContinuousRecognitionAsync()
      }
    } else {
      recognizer.stopContinuousRecognitionAsync()
    }

    setRecordFlag(!recordFlag)
    setListening(!listening)
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
      setAiCount(messages.filter((item) => item.role !== 'system').length)
    }
  }, [response])

  useEffect(() => {
    if (sending && messages.length > 0) {
      handleGenAIResponse(messages)
    }
  }, [sending])

  useLayoutEffect(() => {
    setTimeout(() => {
      const dom = messagesEndRef.current
      if (dom && !isIOS() && autoScroll) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 500)
  })

  return (
    <>
      <div className="w-full max-w-3xl flex-1 flex flex-col gap-2 mt-4 border-solid border-2 border-gray-200 text-gray-900 py-2 px-4 rounded-lg overflow-y-auto">
        {displayMessages.length > 0 ? (
          <>
            {displayMessages.map(({ role, content }, index) =>
              role === 'user' ? (
                <UserPanel key={index} content={content} />
              ) : (
                <AIPanel
                  key={index}
                  content={content}
                  index={index}
                  sending={sending}
                />
              )
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <p className="self-center">You are chatting with an AI teacher</p>
        )}
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
          {listening ? (
            <div className="flex gap-1 items-center">
              <span>Speaking</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>
          ) : (
            <span>Record</span>
          )}
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
