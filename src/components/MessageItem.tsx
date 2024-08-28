import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Volume2, VolumeX, Copy, Languages, Loader } from 'lucide-react'
import { Message } from '@/components/TalkBoost'
import { TRANSLATE_SYSTEM_PROMPT, TRANSLATE_PROMPT } from '@/constants'
import { requestChatAI } from '@/apis/chatAI'

interface Props {
  index: number
  message: Message
  isSpeaking: boolean
  currentSpeakingIndex: number | null
  toggleSpeaking: (message: string, index: number) => void
}

const MessageItem: React.FC<Props> = ({
  index,
  message,
  isSpeaking,
  currentSpeakingIndex,
  toggleSpeaking,
}) => {
  const { content, role } = message
  const isAssistant = role === 'assistant'

  const [translating, setTranslating] = useState(false)
  const [translateContent, setTranslateContent] = useState(null)

  const handleTranslate = async () => {
    const translateMessages = [
      {
        role: 'system',
        content: TRANSLATE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `${TRANSLATE_PROMPT}${content}`,
      },
    ]

    setTranslating(true)
    try {
      const aiResponse = await requestChatAI(translateMessages)
      if (aiResponse) {
        setTranslateContent(aiResponse)
      }
    } catch (error) {
      console.error('Error translating message:', error)
    } finally {
      setTranslating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  const buttonClass =
    'flex h-7 w-7 items-center justify-center rounded bg-transparent text-gray-600 transition duration-200 hover:bg-white hover:text-gray-800'

  return (
    <div className={`mb-4 ${isAssistant ? 'text-left' : 'text-right'}`}>
      <div
        className={`inline-block rounded-lg px-2 ${
          isAssistant ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
        {translateContent && (
          <>
            <div className='my-2 border-t border-gray-300'></div>
            <ReactMarkdown>{translateContent}</ReactMarkdown>
          </>
        )}
        {isAssistant && (
          <div className='flex items-center gap-1'>
            <button
              onClick={() => toggleSpeaking(content, index)}
              className={buttonClass}
            >
              {currentSpeakingIndex === index && isSpeaking ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
            <button
              onClick={handleTranslate}
              className={`${buttonClass} ${
                translating ? 'animate-pulse bg-gray-300' : ''
              }`}
              disabled={translating}
            >
              {translating ? (
                <Loader size={16} className='animate-spin' />
              ) : (
                <Languages size={16} />
              )}
            </button>
            <button onClick={handleCopy} className={buttonClass}>
              <Copy size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem
