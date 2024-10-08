import { useState } from 'react'
import { useAtom } from 'jotai'
import { Button, Divider, message } from 'antd'
import { requestChatAI } from '@/apis/chatAI'
import { openVoiceAtom } from '@/state'
import { TRANSLATE_SYSTEM_PROMPT, TRANSLATE_PROMPT } from '@/constants'
import { TranslationOutlined, CopyOutlined } from '@ant-design/icons'
import PlayerBtn from './PlayerBtn'
import ReactMarkdown from 'react-markdown'
import Avvvatars from 'avvvatars-react'
import { isMobile } from 'react-device-detect'

const AIPanel: React.FC<{
  index: number
  content: string
  sending: boolean
}> = ({ content, index }) => {
  const [openVoice] = useAtom(openVoiceAtom)
  const [translating, setTranslating] = useState(false)
  const [translateContent, setTranslateContent] = useState(null)

  const [messageApi, contextHolder] = message.useMessage()

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
      console.error(error)
    }
    setTranslating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    messageApi.info('Copy successfully!')
  }

  return (
    <div className='flex justify-start gap-1'>
      <div>
        <Avvvatars value={'AI'} style='shape' size={isMobile ? 24 : 32} />
      </div>
      <div className='flex flex-col flex-nowrap gap-1'>
        {contextHolder}
        <div className='self-start rounded-lg bg-slate-50 px-4 py-2 text-left font-normal text-gray-900'>
          <ReactMarkdown>{content}</ReactMarkdown>
          {translateContent && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <ReactMarkdown>{translateContent}</ReactMarkdown>
            </>
          )}
        </div>

        <div className='flex items-center gap-1'>
          {openVoice && <PlayerBtn index={index} content={content} />}
          <Button onClick={handleCopy} size='small' icon={<CopyOutlined />} />
          <Button
            onClick={handleTranslate}
            size='small'
            loading={translating}
            disabled={translating}
            icon={<TranslationOutlined />}
          />
        </div>
      </div>
    </div>
  )
}

export default AIPanel
