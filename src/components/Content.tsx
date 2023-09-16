import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import { requestOpenAI } from '~/apis/openai'
import { getSpeakToTextApi } from '~/apis/newTTS'
import { isIOS, getLocal } from '~/utils'
import { SettingOutlined, PlusOutlined } from '@ant-design/icons'
import { Input, Button } from 'antd'
import SettingsModal from './SettingsModal'
import AIPanel from './AIPanel'
import { useAtom } from 'jotai'
import { openAiCount } from '~/state'
import { ENGLISH_TEACHER } from '~/constants'
import HistoryPanel from './HistoryPanel'
import { recordNowHistoryName } from '~/state/settings'

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

  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [listening, setListening] = useState<boolean>(false)
  const [recognizer, setRecognizer] = useState<any>({})
  const [recordName, setRecordName] = useAtom(recordNowHistoryName)

  // auto scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState<boolean>(false)
  const [waiting, setWaiting] = useState<boolean>(false)
  const [, setAiCount] = useAtom(openAiCount)
  const historyRef = useRef(null)
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

  const addNewHistory = () => {
    historyRef.current.handleAdd()
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

  useEffect(() => {
    let historyList = getLocal('history')
    let currentList =
      historyList?.find((item) => item.name === recordName)?.details || []
    setMessages(currentList.filter((item) => item.role !== 'system'))
  }, [recordName])

  useLayoutEffect(() => {
    setTimeout(() => {
      const dom = messagesEndRef.current
      if (dom && !isIOS() && autoScroll) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 500)
  })

  const displayMessages = messages.slice()

  return (
    <>
      <HistoryPanel ref={historyRef} msgList={messages} />
      <div className="w-full h-full max-w-3xl flex flex-1 flex-col items-center">
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
          {isIOS() && (
            <PlusOutlined
              onClick={addNewHistory}
              className="self-start mt-4 mb-2 pl-2 text-gray-500 cursor-pointer"
            />
          )}
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
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}

export default Content
