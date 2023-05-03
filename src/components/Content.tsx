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
import { requestOpenAI } from '~/apis/openai'
import { requestGetVoiceApi, requestGetTTSApi } from '~/apis/tts'
import { getSpeakToTextApi, getTextToSpeakApi } from '~/apis/newTTS'
import { isIOS } from '~/utils'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Switch } from '@headlessui/react'
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')
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
      <TTSPanel enabled={enabled} content={content} sending={sending} />
    </div>
  )
}

const TTSPanel: React.FC<{
  content: string
  sending: boolean
  enabled: boolean
}> = ({ content, sending, enabled }) => {
  const [audioSource, setAudioSource] = useState(null)
  const [voice, setVoiceList] = useState<any[]>([])
  const [speak, setSpeak] = useState<boolean>(false)
  const [openSounds, setOpenSounds] = useState<boolean>(false)
  const [speechSynthesizer, setSpeechSynthesizer] = useState<any>({})
  const audioRef = useRef(null)
  const handleSpeak = () => {
    if (!speak) {
      audioRef.current.play()
      setSpeak(true)
      setOpenSounds(false)
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
    if (enabled) {
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
        },
      )
    } catch (error) {
      console.error('error', error)
    }
  }
  // 这个是语音样本
  // useEffect(() => {
  //   if (voice.length === 0) {
  //     requestGetVoiceApi((data) => {
  //       setVoiceList([...data.voices]);
  //     });
  //   }
  // }, [voice]);

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
  const [enabled, setEnabled] = useState<boolean>(true)
  const [listening, setListening] = useState<boolean>(false)
  const [recognizer, setRecognizer] = useState<any>({})

  // auto scroll
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState<boolean>(false)
  const [waiting, setWaiting] = useState<boolean>(false)
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
        },
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
      <div>
        <span className="text-blue-600 mr-2">Open the AI Voice Assistant:</span>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${enabled ? 'bg-teal-900' : 'bg-teal-700'}
          align-middle relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'}
            pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col gap-2 my-4 border-2 font-bold py-2 px-4 rounded-lg overflow-y-auto">
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
            ),
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
