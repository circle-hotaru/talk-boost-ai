import React, { useState, useEffect, useRef } from 'react'
import { Send, Mic, MicOff, Loader } from 'lucide-react'
import {
  PlusIcon,
  HamburgerMenuIcon,
  TrashIcon,
  GearIcon,
} from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from 'antd'
import { requestChatAI } from '@/apis/chatAI'
import { azureSynthesizeSpeech } from '@/apis/azureTTS'
import MessageItem from './MessageItem'
import Settings from './Settings'
import Footer from './Footer'
import { SpeakerAudioDestination } from 'microsoft-cognitiveservices-speech-sdk'

export type Message = {
  role: string
  content: string
}

export type Messages = Array<Message>

type Chats = Array<{
  id: number
  messages: Messages
}>

const SYSTEM_MESSAGE = {
  role: 'system',
  content: 'You are a professional education assistant.',
}

const { TextArea } = Input

const TalkBoost = () => {
  const [chats, setChats] = useState<Chats>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Messages>([SYSTEM_MESSAGE])
  const [inputMessage, setInputMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef(null)

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null)
  const audioRef = useRef<SpeakerAudioDestination | null>(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)

  const createNewChat = () => {
    setCurrentChatId(null)
    setMessages([SYSTEM_MESSAGE])
    setIsSidebarOpen(false)
  }

  const updateChat = (chatId: number, newMessages: Messages) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, messages: newMessages } : chat
      )
    )
  }

  const clearSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsSpeaking(false)
      setCurrentSpeakingIndex(null)
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return

    setIsLoading(true)
    setError(null)
    const newUserMessage = { role: 'user', content: inputMessage }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setInputMessage('')

    let chatId = currentChatId
    if (currentChatId === null) {
      chatId = Date.now()
      setCurrentChatId(chatId)
      setChats((prevChats) => [
        { id: chatId, messages: updatedMessages },
        ...prevChats,
      ])
    } else {
      updateChat(chatId, updatedMessages)
    }

    try {
      clearSpeaking()

      const aiResponse = await requestChatAI(updatedMessages)
      const assistantMessage = { role: 'assistant', content: aiResponse }
      const newMessages = [...updatedMessages, assistantMessage]
      const speakingIndex = messages.length
      setMessages(newMessages)
      updateChat(chatId, newMessages)

      if (isTTSEnabled) {
        // 合成语音后会自动播放
        const player = azureSynthesizeSpeech(aiResponse)
        player.onAudioStart = () => {
          setIsSpeaking(true)
          setCurrentSpeakingIndex(speakingIndex)
        }
        player.onAudioEnd = () => {
          setIsSpeaking(false)
          setCurrentSpeakingIndex(null)
        }
        audioRef.current = player
      }
    } catch (err) {
      setError(
        'Failed to get AI response or synthesize speech. Please try again.'
      )
      console.error('Error getting AI response:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePressEnter = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleDeleteChat = (chatId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
    if (chatId === currentChatId) {
      setCurrentChatId(null)
      setMessages([SYSTEM_MESSAGE])
    }
  }

  const getChatTitle = (chat: { messages: Messages }) => {
    const firstUserMessage = chat.messages.find((msg) => msg.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.length > 30
        ? firstUserMessage.content.substring(0, 27) + '...'
        : firstUserMessage.content
    }
    return 'New Conversation'
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const toggleSpeaking = (message: string, index: number) => {
    const isCurrentSpeakingIndex = currentSpeakingIndex === index

    if (isSpeaking) {
      if (isCurrentSpeakingIndex) {
        audioRef.current?.pause()
        setIsSpeaking(false)
      } else {
        clearSpeaking()
        const newPlayer = azureSynthesizeSpeech(message)
        newPlayer.onAudioStart = () => {
          setIsSpeaking(true)
          setCurrentSpeakingIndex(index)
        }
        newPlayer.onAudioEnd = () => {
          setIsSpeaking(false)
          setCurrentSpeakingIndex(null)
        }
        audioRef.current = newPlayer
      }
    } else {
      if (audioRef.current && isCurrentSpeakingIndex) {
        audioRef.current?.resume()
      } else {
        clearSpeaking()
        const newPlayer = azureSynthesizeSpeech(message)
        newPlayer.onAudioStart = () => {
          setIsSpeaking(true)
          setCurrentSpeakingIndex(index)
        }
        newPlayer.onAudioEnd = () => {
          setIsSpeaking(false)
          setCurrentSpeakingIndex(null)
        }
        audioRef.current = newPlayer
      }
      setIsSpeaking(true)
    }
  }

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleTTSToggle = (enabled: boolean) => {
    setIsTTSEnabled(enabled)
    localStorage.setItem('ttsEnabled', JSON.stringify(enabled))
  }

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chats') || '[]')
    setChats(storedChats)

    const storedTTSEnabled = localStorage.getItem('ttsEnabled')
    if (storedTTSEnabled !== null) {
      setIsTTSEnabled(JSON.parse(storedTTSEnabled))
    }

    return () => {
      clearSpeaking()
    }
  }, [])

  // 设置语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      recognitionRef.current = new webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
        setInputMessage(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  return (
    <div className='flex h-screen max-h-screen bg-gray-50'>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`w-64 bg-white p-4 text-gray-800 md:block ${
          isSidebarOpen ? 'block' : 'hidden'
        } absolute z-10 h-full shadow-lg md:relative`}
      >
        <button
          onClick={createNewChat}
          className='mb-4 flex w-full items-center justify-center rounded bg-blue-500 p-2 text-white transition duration-200 hover:bg-blue-600'
        >
          <PlusIcon className='mr-2' /> New Conversation
        </button>
        <div className='overflow-y-auto'>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id)
                setMessages(chat.messages)
                setIsSidebarOpen(false)
              }}
              className={`mb-2 flex cursor-pointer items-center justify-between rounded p-2 ${
                chat.id === currentChatId ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <span className='flex-grow truncate'>{getChatTitle(chat)}</span>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className='flex h-7 w-7 items-center justify-center rounded bg-white text-gray-400 transition duration-200 hover:text-red-500'
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className='flex flex-1 flex-col'>
        <header className='flex items-center justify-between bg-white p-4 text-gray-800 shadow-sm'>
          <button
            className='bg-transparent text-gray-600 md:hidden'
            onClick={toggleSidebar}
          >
            <HamburgerMenuIcon className='h-6 w-6' />
          </button>
          <h1 className='m-0 text-2xl font-bold'>Talk Boost</h1>
          <Button variant='ghost' size='icon' onClick={toggleSettings}>
            <GearIcon className='h-6 w-6' />
          </Button>
        </header>

        <main className='flex flex-grow flex-col overflow-hidden'>
          <div className='flex-grow overflow-auto p-4'>
            <div className='mx-auto max-w-3xl'>
              {messages
                .filter((message) => message.role !== 'system')
                .map((message, index) => (
                  <MessageItem
                    key={index}
                    message={message}
                    index={index}
                    isSpeaking={isSpeaking}
                    currentSpeakingIndex={currentSpeakingIndex}
                    toggleSpeaking={toggleSpeaking}
                  />
                ))}
              {error && (
                <div className='mb-4 text-center'>
                  <span className='rounded-lg bg-red-100 p-2 text-red-600'>
                    {error}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className='border-t border-gray-200 bg-white p-4'>
            <div className='mx-auto flex max-w-3xl items-center'>
              <TextArea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={handlePressEnter}
                placeholder='Type your message here'
                autoSize={{ minRows: 1, maxRows: 6 }}
                allowClear
                className='mr-2 flex-grow resize-none overflow-auto'
                style={{ minHeight: '36px' }}
              />
              <button
                onClick={toggleListening}
                className={`mr-2 flex h-9 w-9 items-center justify-center rounded ${
                  isListening ? 'bg-red-500' : 'bg-blue-100 text-blue-500'
                } transition duration-200 ${
                  isListening ? 'hover:bg-red-600' : 'hover:bg-blue-200'
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className='flex h-9 w-9 items-center justify-center rounded bg-blue-500 text-white transition duration-200 hover:bg-blue-600 disabled:opacity-50'
              >
                {isLoading ? (
                  <Loader size={24} className='animate-spin' />
                ) : (
                  <Send size={24} />
                )}
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {isSettingsOpen && (
        <Settings
          isTTSEnabled={isTTSEnabled}
          onTTSToggle={handleTTSToggle}
          onClose={toggleSettings}
        />
      )}
    </div>
  )
}

export default TalkBoost
