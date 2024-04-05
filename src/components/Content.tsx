import {
  useEffect,
  useState,
  KeyboardEventHandler,
  useRef,
  useLayoutEffect,
} from 'react'
import { requestOpenAI } from '~/apis/openai'
import { getSpeakToTextApi } from '~/apis/azureTTS'
import { isIOS, getLocal } from '~/utils'
import { PlusOutlined } from '@ant-design/icons'
import { Input, Button } from 'antd'
import AIPanel from './AIPanel'
import { useAtom } from 'jotai'
import { openAiCount, openVoiceAtom } from '~/state'
import { SYSTEM_MESSAGE } from '~/constants'
import HistoryPanel from './HistoryPanel'
import UserPanel from './UserPanel'
import Onboarding from './Onboarding'
import { recordNowHistoryName } from '~/state/settings'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { SpeakerModerateIcon, SpeakerOffIcon } from '@radix-ui/react-icons'
import VoiceSetting from './VoiceSetting'

const { TextArea } = Input

const Content: React.FC = () => {
  const { t } = useTranslation()
  const [sending, setSending] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'system',
      content: SYSTEM_MESSAGE,
    },
  ])

  const [response, setResponse] = useState<string>('')
  const [recordFlag, setRecordFlag] = useState<boolean>(false)
  const [listening, setListening] = useState<boolean>(false)
  const [recognizer, setRecognizer] = useState<any>({})
  const [recordName, setRecordName] = useAtom(recordNowHistoryName)
  const [openVoice, setOpenVoice] = useAtom(openVoiceAtom)

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

  const handleOpenVoice = () => {
    setOpenVoice(!openVoice)
  }

  useEffect(() => {
    if (response.length !== 0 && response !== 'undefined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ])
      setSending(false)
      setAiCount(messages.slice(2).length)
    }
  }, [response])

  useEffect(() => {
    if (sending && messages.length > 0) {
      handleGenAIResponse(messages)
    }
  }, [sending])

  useEffect(() => {
    let historyList = getLocal('history')
    let currentList = historyList?.find((item) => item.name === recordName)
      ?.details || [
      {
        role: 'system',
        content: SYSTEM_MESSAGE,
      },
    ]
    setMessages(currentList)
  }, [recordName])

  useLayoutEffect(() => {
    setTimeout(() => {
      const dom = messagesEndRef.current
      if (dom && !isIOS() && autoScroll) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 500)
  })

  const displayMessages = messages.slice(2)
  const isOnboarding = displayMessages.length === 0

  return (
    <>
      <HistoryPanel ref={historyRef} msgList={messages} />
      <div className='flex h-full w-full max-w-3xl flex-1 flex-col items-center'>
        <div className='flex w-full max-w-3xl flex-1 flex-col gap-2 overflow-y-auto rounded-lg border-2 border-solid border-gray-line px-4 py-2 text-gray-900'>
          {!isOnboarding ? (
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
            <Onboarding
              setMessages={setMessages}
              sending={sending}
              setSending={setSending}
            />
          )}
        </div>

        {!isOnboarding && (
          <div className='m-2 mt-4 flex w-full max-w-3xl flex-row flex-wrap items-center justify-start gap-2'>
            <Button
              className=' flex items-center justify-center'
              onClick={handleOpenVoice}
              size='small'
              icon={openVoice ? <SpeakerModerateIcon /> : <SpeakerOffIcon />}
            />
            <VoiceSetting />
            {isMobile && (
              <PlusOutlined
                onClick={addNewHistory}
                className='cursor-pointer text-gray-700'
              />
            )}
          </div>
        )}

        {!isOnboarding && (
          <div className='mx-auto flex w-full max-w-3xl flex-wrap items-center justify-end gap-2'>
            <TextArea
              placeholder='Type your message here'
              autoSize={{ minRows: 1, maxRows: 6 }}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => setAutoScroll(true)}
              onBlur={() => setAutoScroll(false)}
              autoFocus
              allowClear
              onPressEnter={handleKeyDown}
              className='w-full flex-none md:flex-1 '
            />
            <Button type='primary' onClick={handleRecord}>
              {listening ? (
                <div className='flex items-center gap-1'>
                  <span>{t('in_chat')}</span>
                  <span className='relative flex h-3 w-3'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75'></span>
                    <span className='relative inline-flex h-3 w-3 rounded-full bg-sky-500'></span>
                  </span>
                </div>
              ) : (
                <span>{t('chat')}</span>
              )}
            </Button>
            <Button onClick={handleSend} disabled={sending} loading={sending}>
              {t('send')}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default Content
