import ReactMarkdown from 'react-markdown'
import { Volume2, VolumeX } from 'lucide-react'
import { Message } from '@/components/TalkBoost'

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

  return (
    <div className={`mb-4 ${isAssistant ? 'text-left' : 'text-right'}`}>
      <div
        className={`inline-block rounded-lg px-2 ${
          isAssistant ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
        {isAssistant && (
          <button
            onClick={() => toggleSpeaking(content, index)}
            className='flex h-7 w-7 items-center justify-center bg-transparent text-gray-600 hover:text-gray-800'
          >
            {currentSpeakingIndex === index && isSpeaking ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageItem
