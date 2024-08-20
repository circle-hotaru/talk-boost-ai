import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Plus,
  Menu,
  Trash2,
  Mic,
  MicOff,
  Loader,
  VolumeX,
  Volume2,
} from 'lucide-react'
import { Input } from 'antd'
import { requestNagaAI } from '~/apis/nagaAI'
import { azureSpeechSynthesize } from '~/apis/azureTTS'
import { SpeakerAudioDestination } from 'microsoft-cognitiveservices-speech-sdk'

export type Messages = Array<{
  role: string
  content: string
}>

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
  const audioRef = useRef<SpeakerAudioDestination | null>(null)

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
      const aiResponse = await requestNagaAI(updatedMessages)
      const assistantMessage = { role: 'assistant', content: aiResponse }
      const newMessages = [...updatedMessages, assistantMessage]
      setMessages(newMessages)
      updateChat(chatId, newMessages)

      // 合成语音并自动播放
      const player = azureSpeechSynthesize(aiResponse)
      player.onAudioStart = () => {
        setIsSpeaking(true)
      }
      player.onAudioEnd = () => {
        setIsSpeaking(false)
      }
      audioRef.current = player
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

  const toggleSpeech = () => {
    if (audioRef.current) {
      if (isSpeaking) {
        audioRef.current.pause()
        setIsSpeaking(false)
      } else {
        audioRef.current.resume()
        setIsSpeaking(true)
      }
    }
  }

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chats') || '[]')
    setChats(storedChats)

    return () => {
      if (audioRef.current) {
        audioRef.current.close()
      }
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
    <div className='flex h-screen bg-gray-50'>
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
          <Plus size={20} className='mr-2' /> New Conversation
        </button>
        <div className='h-full overflow-y-auto'>
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
                <Trash2 size={18} />
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
            <Menu size={24} />
          </button>
          <h1 className='m-0 text-2xl font-bold'>Talk Boost</h1>
        </header>

        <main className='flex flex-grow flex-col overflow-hidden'>
          <div className='flex-grow overflow-auto p-4'>
            <div className='mx-auto max-w-3xl'>
              {messages
                .filter((message) => message.role !== 'system')
                .map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg p-2 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.content}
                      {message.role === 'assistant' && (
                        <button
                          onClick={toggleSpeech}
                          className='flex h-7 w-7 items-center justify-center bg-transparent text-gray-600 hover:text-gray-800'
                        >
                          {isSpeaking ? (
                            <VolumeX size={16} />
                          ) : (
                            <Volume2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
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

        <footer className='bg-white py-2 text-center text-sm text-gray-600 shadow-md'>
          Made with love by{' '}
          <a
            href='https://github.com/circle-hotaru'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium text-blue-500'
          >
            incircle
          </a>
        </footer>
      </div>
    </div>
  )
}

export default TalkBoost
